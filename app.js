// var ip = prompt('введите LAN IP своего роутера', '193.0.174.161')
var ip = '193.0.174.161'

// var proxy = function(url) {
// 	var _proxy = 'http://localhost:1337'
// 	return _proxy + '?proxy=true&src=' + url
// }


// RemoteCommand.parameters = [
// 	name:,
// 	args,
// 	parse,
// 	success,
// 	onFail
// ]

var deferrize = function(x) {
	if (isDeferred(x)) {
		return x
	}
	else {
		var defer = new $.Deferred()
		return defer.resolve(x)
	}
}

var isDeferred = function(func) {
	return (typeof func == 'object' &&  'promise' in func && $.isFunction(func.promise))
}

var doRemoteCommand = function(command, callback) {
	return $.ajax({
		type: 'POST',
		url: 'proxy/ci', 
		xhrFields: {
	    	withCredentials: true
		},
		contentType: 'application/xml',
		data: command,
		dataType: 'xml'
	}).done(callback)
}

var RemoteCommand = function(options) {
	$.extend(this, this.defaults, options)
	return this.execute()
}
RemoteCommand.prototype.defaults = {
	type: 'command',
	args: {}
}
RemoteCommand.prototype.toString = function() {
	var that = this
	return '<' + this.type + ' name="' + this.name + '">\n' +
		Object.keys(this.args).map(function(key) { return '<' + key + '>' + that.args[key] + '</' + key + '>'}).join('\n') + ' \n' + 
		'</' + this.type + '>' //TODO this.arguments.join
}
RemoteCommand.prototype.execute = function() {
	var defer = $.Deferred()
	var that = this
	var text = '<request id=\'0\'>\n ' + this + '</request>'
	// var text = '<request id="0"><parse>' + command.name + '</parse></request>'
	doRemoteCommand(text, function(data) {
		var parsed
		if (that.parse) {
			parsed = that.parse(data)
		}
		defer.resolve(parsed)
	})
	return defer
};

var cl = function() {
	console.log('cl', arguments)
	return Array.prototype.join.call(arguments, ', ')
}

var ___ = function(func) {
	var context = this
	return function() {
		var wrapper = $.Deferred()
		var args = Array.prototype.slice.call(arguments) // toArray
		var onReady = function() {
			var result = func.apply(context, args)
			console.log("result is: ", result, args, func)
			wrapper.resolve(result)
		}

		var deferredIndexes = []
		var deferred = []
		for (var i in args) {
			if (typeof args[i] == 'object' &&  'promise' in args[i] && $.isFunction(args[i].promise)) {
				deferredIndexes[i] = i
				deferred.push(args[i])
				// deffered.reject(function(arguments) {
				// 	var arguments = Array.prototype.slice.call(arguments)
				// 	wrapper.reject.apply(wrapper, arguments)
				// })
				args[i].fail($.proxy(wrapper.reject, wrapper))
			}
		}

		console.log(deferred, args);

		if (deferred.length > 0) {
			// console.log("w", deferred, $.isArray(deferred));
			$.when.apply($, deferred).then(function() {
				var argumentss = Array.prototype.slice.call(arguments)
				for (var i in args) {
					if (deferredIndexes[i] != undefined) {
						args[i] = argumentss.shift()
					}
				}
				onReady()
			})
		}
		else {
			setTimeout(onReady)
		}
		return wrapper
	}
}

var forwardSinglePortScenario = function() {
	$.when(fixIp2(), setNatOn("Home")).then(function() { //откуда берем имя интерфейса?
		var portIn = ask("входящий порт")
		var protocol = ask("протокол (TCP/UDP)")
		// var ip = getMyIp()
		var ip = "192.168.1.34"
		var wanName = getWanName()
		___(forwardSinglePort)(portIn, portIn, protocol, ip, wanName).then(cl)
	})
}

var Scenario = function(scenario, vendorMethods) {
	var that = this
	this.steps = scenario.steps.map(function(step) {
		step.func = vendorMethods[step.type]
		if (!step.func) throw ("bad method: " + step.type)
		return new Step(step)
	})
	scenario.links.forEach(function(link) {
		var step = that.getStep(link.to)
		step.inLinks = step.inLinks || {}
		step.inSuccessLinks = step.inSuccessLinks || []
		var childStep = that.getStep(link.from)
		if (link.port == 'success') {
			step.inSuccessLinks.push(childStep)
		}
		else {
			step.inLinks[link.port] = childStep
		}
	})
}

Scenario.prototype.getStep = function(id) { //type is step/link
	var step = this.steps[_(this.steps).pluck('id').indexOf(id)]
	if (!step) {
		throw ('can`t find step with id ' + id)
	}
	return this.steps[_(this.steps).pluck('id').indexOf(id)]
}

Scenario.prototype.getInSteps = function(step) {
	var that = this
	return this.links.filter(function(link) {
		return link.to == step.id
	}).map(function(link) {
		return {
			value: link.port,
			step: that.getStep(link.from)
		}
	})
};

var Step = function(step) {
	$.extend(this, step)
}


Step.prototype.process = function() {
	// var end = this.step.filter(function(step) { return this.type == 'end'})[0]
	var that = this
	console.log(this.type);
	if (this.inLinks) {
		var defer = $.Deferred()
		var steps = _(this.inLinks).values().concat(this.inSuccessLinks)
		var methods = _(steps).map(function(step) {
			try {
				// return _.bind(step.process, step)
				return step.process()
			}
			catch (e){
				console.log(step);
				throw e
			}
		})
		var values = _(this.inLinks).keys()

		$.when.apply($, methods).then(function() {
			var args = arguments
			var namedArgs = {}
			console.log(args);
			values.forEach(function(value, i) {
				// if (value != "success") {
					namedArgs[value] = args[i]
				// }
			})

			console.log(namedArgs, arguments, that.type)
			var y = that.execute(namedArgs)
			$.when(y).then(defer.resolve)
		})
		return defer
	}
	else {
		return that.execute()
	}
}

Step.prototype.execute = function(args) {
	var result = this.func(args, this.parameters)
	// console.log(args, isDeferred(result), result, this.type);
	return deferrize(result)
}

s = new Scenario(scenario, zyxelCom)

// s.steps[3].process()