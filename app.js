// var ip = prompt('введите LAN IP своего роутера', '193.0.174.161')
var ip = 'http://89.207.94.147/'

var _commandId = 0;
var sc = "{\"steps\":[{\"id\":\"b351240f-2304-4210-9478-21deb326b033\",\"type\":\"forwardSinglePort\"},{\"id\":\"cd700536-f461-42ab-8988-1927f303cf68\",\"type\":\"end\"},{\"id\":\"aa8682de-170d-461b-9fdc-96942aa693e0\",\"type\":\"ask\",\"parameter\":\"port from\"},{\"id\":\"45359fdf-a71e-4db3-b100-ebbdf582b107\",\"type\":\"ask\",\"parameter\":\"protocol\"},{\"id\":\"245319b7-87f7-44f2-b09e-020cc4e1780d\",\"type\":\"getMyIp\"},{\"id\":\"e4933c00-8f68-416c-83f2-e348009bf742\",\"type\":\"getWanName\"},{\"id\":\"73c9a164-3fd7-471c-be6d-37887183c57a\",\"type\":\"getDhcpTable\"},{\"id\":\"ed3697d1-8427-4a22-b86a-95036ad10069\",\"type\":\"getMyIp\"},{\"id\":\"12a6975f-2585-4652-8591-412c6f10787e\",\"type\":\"getMyMac\"},{\"id\":\"e16ccd50-7afe-4500-9a6f-2f8904a8b459\",\"type\":\"fixIp\"},{\"id\":\"0f78ffe1-b5b6-49b0-a10c-0c7a1a841d6e\",\"type\":\"getMyIp\"}],\"links\":[{\"from\":\"b351240f-2304-4210-9478-21deb326b033\",\"to\":\"cd700536-f461-42ab-8988-1927f303cf68\",\"port\":\"\"},{\"from\":\"aa8682de-170d-461b-9fdc-96942aa693e0\",\"to\":\"b351240f-2304-4210-9478-21deb326b033\",\"port\":\"portFrom\"},{\"from\":\"45359fdf-a71e-4db3-b100-ebbdf582b107\",\"to\":\"b351240f-2304-4210-9478-21deb326b033\",\"port\":\"protocol\"},{\"from\":\"245319b7-87f7-44f2-b09e-020cc4e1780d\",\"to\":\"b351240f-2304-4210-9478-21deb326b033\",\"port\":\"ipTo\"},{\"from\":\"e4933c00-8f68-416c-83f2-e348009bf742\",\"to\":\"b351240f-2304-4210-9478-21deb326b033\",\"port\":\"interfaceName\"},{\"from\":\"ed3697d1-8427-4a22-b86a-95036ad10069\",\"to\":\"12a6975f-2585-4652-8591-412c6f10787e\",\"port\":\"ip\"},{\"from\":\"73c9a164-3fd7-471c-be6d-37887183c57a\",\"to\":\"12a6975f-2585-4652-8591-412c6f10787e\",\"port\":\"dhcpTable\"},{\"from\":\"12a6975f-2585-4652-8591-412c6f10787e\",\"to\":\"e16ccd50-7afe-4500-9a6f-2f8904a8b459\",\"port\":\"mac\"},{\"from\":\"0f78ffe1-b5b6-49b0-a10c-0c7a1a841d6e\",\"to\":\"e16ccd50-7afe-4500-9a6f-2f8904a8b459\",\"port\":\"ip\"},{\"from\":\"e16ccd50-7afe-4500-9a6f-2f8904a8b459\",\"to\":\"b351240f-2304-4210-9478-21deb326b033\",\"port\":\"success\"}]}"

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

// var doRemoteCommand = function(command, callback) {
// 	return $.ajax({
// 		type: 'POST',
// 		url: 'proxy/ci', 
// 		xhrFields: {
// 	    	withCredentials: true
// 		},
// 		contentType: 'application/xml',
// 		data: command,
// 		dataType: 'xml'
// 	}).done(callback)
// }

var callbacks = {};

var doRemoteCommand = function(command, callback) {
	// var defer = $.Deferred()
	// defer.done(callback)
	var commandHtml = $('<pre>').attr('id', ++_commandId)
		.text(command)
	console.log(_commandId, commandHtml);
	$('#commandContainer>#send').append(commandHtml)
	$('#commandContainer>#send').click()
	callbacks[_commandId] = callback
	// callbacks[_commandId] = defer
	// return defer
}

// $('#commandContainer>#receive').click(function() {
window.addEventListener('message', function(message) {
	var id = message.data
	var response = $('#commandContainer>#receive>#' + id)
	if (response.length != 1) {
		throw ('response count != 1 (' + response.length + ')')
	}
	var responseText = $(response).text().trim()
	var callback = callbacks[id]
	if (!callback) {
		throw('no callback with id = ' + id)
	}
	console.log(id, responseText)
	callback(responseText)
	response.remove()
	delete callbacks[id]
})



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
	// console.log(this.args)
	return '<' + this.type + ' name="' + this.name + '">\n' +
		Object.keys(this.args).map(function(key) { return '<' + key + '>' + that.args[key] + '</' + key + '>'}).join('\n') + ' \n' + 
		'</' + this.type + '>' //TODO this.arguments.join
}
RemoteCommand.prototype.execute = function() {
	var defer = $.Deferred()
	var that = this
	var text = '<request id=\'0\'>\n ' + this.toString() + '\n</request>'
	// var text = '<request id="0"><parse>' + command.name + '</parse></request>'
	doRemoteCommand(text, function(data) {
		var parsed
		var error = $(data).find('error')
		if (error.length) {
			throw('error ' + error.text() + ' (' + error.attr('source') + ')')
		}
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
		if (link.port == 'success' || link.port == "") {
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
}

Scenario.prototype.getRoot = function() {
	return this.steps.filter(function(step) {
		return step.type == 'end'
	})[0]
}

Scenario.prototype.process = function(callback) {
	this.getRoot()
		.process()
		.done(callback)
}

Scenario.prototype.print = function(target, step) {
	if (!step) {
		var step = this.getRoot()
		var target = $('<ul>').appendTo($(target))
	}

	target.append('<li>' + step.type + '</li>')
	if (step.inLinks || step.inSuccessLinks) {
		var container = $('<ul>').appendTo(target)
		var allInLinks = $.extend(step.inLinks, step.inSuccessLinks)
		for (var i in allInLinks) {
			var stepChild = allInLinks[i]
			Scenario.prototype.print(container, stepChild)
		}
	}
}

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
				console.log(e.stack)
				throw e
			}
		})
		var values = _(this.inLinks).keys()

		$.when.apply($, methods).then(function() {
			var args = arguments
			var namedArgs = {}
			values.forEach(function(value, i) {
				// if (value != "success") {
					namedArgs[value] = args[i]
				// }
			})

			// console.log(namedArgs, arguments, that.type)
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
	var result = this.func(args, [this.parameter])
	return deferrize(result)
}

var s = new Scenario(JSON.parse(sc), zyxelCom)

// s.process()