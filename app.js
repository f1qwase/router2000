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

parallel = function(deferreds) { // typeof deferreds must be Array
	var defer = $.Deferred()
	$.when.apply($, deferreds).then(function() {
		var newArgs = Array.prototype.concat.apply([], arguments)
		defer.resolve.apply(defer, newArgs)
	})
	return defer
}


var getMyIp = function() {
	return new RemoteCommand({
		name: 'whoami',
		parse: function(data) {
			var tag = "host"
			return $(data).find(tag)
		}
	})
}

var getWanName = function() {
	return new RemoteCommand({
		name: 'show interface',
		parse: function(data) {
			return $(data).find('interface').filter(function() {
				return $(this).find('global').text() == 'yes'
			}).attr('name')
		}
	})
}

var getDhcpTable = function() {
	return new RemoteCommand({
		name: 'ip dhcp host',
		type: 'config',
		parse: function(data) {
			return $(data).find('config').map(function() {
				return {
					ip: $(this).find('ip').text(),
					mac: $(this).find('mac').text()
				}
			}).toArray()
		}
	})
}



var ask = function() {
	var args = Array.prototype.join.call(arguments, ', ') || 'ass'
	var defer = $.Deferred()
	setTimeout(function() {
		var answer = prompt('введите через ";" следующие переметры: ' + args)
		defer.resolve.apply(defer, answer.split(';'))
	}, 100)
	return defer
}



var fixIp = function(name, ip, mac) {
	var knownHost = new RemoteCommand({
		name: 'known host',
		args: {
			name: name,
			ip: ip,
			mac: mac
		},
		parse: function() {}
	})
	var hz = new RemoteCommand({
		name: "ip dhcp host",
		args: {
			mac: mac,
			ip: ip
		},
		parse: function() {}
	})
	return $.when(knownHost, hz)
}

var setNatOn = function(interfaceName) {
	return new RemoteCommand({
		name: "ip nat",
		args: {
			interface: interfaceName
		},
		parse: function(data) {
			return $(data).find("message").text() == "NAT rule added."
		}
	})
}

var forwardSinglePort = function(portFrom, portTo, protocol, ipTo, interfaceName) {
	return new RemoteCommand({
		name: "ip static",
		args: {
			"interface": interfaceName,
			"protocol": protocol,
            "port-mode": "single",
            "port": portFrom,
            "to-address": ipTo,
            "to-port": portTo
		},
		parse: function(data) {
			$(data).find("message").text() == "static NAT rule has been added"
		}
	})
}




var cl = function() {
	console.log(arguments)
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

// var ip = ___(getIp)
// var wan = ___(getWanName).exe()

// forwardSinglePort(ip, wan).exe().done(function(result) {
// 	console.log(result)
// })
var getMac = ___(function(ip, dhcpTable) {
	console.log(ip, dhcpTable)
	// var ipIndex = dhcpTable.indexOf(function(i) {
	// 	return i.ip == ip
	// })
	var i = 0
	while (i < dhcpTable.length) {
		if (dhcpTable[i].ip == ip) {
			return dhcpTable[i].mac
		}
	}
	return "fail"
})

var defery = function(callback) {
	var defer = $.Deferred()

}




// var answer = ask("a", "b")
var answer = 'asd'
// var getMac = function() {
// 	var defer = ___(function(ip, dhcpTable) {
// 		defer.resolve(dhcpTable[ip])
// 	})
// }

var fixIp2 = ___(function() {
	var dhcpTable = getDhcpTable()
	// var ip = getMyIp(),
	var ip = "192.168.1.34"
	var mac = getMac(ip, dhcpTable)
	return ___(fixIp)("defaultName", ip, mac)
})

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



// ___(cl)("2", wanName, dhcpTable, "3", answer).done(function() {
// 	console.log("aaaaaaaaaaaaaaaaaa" , arguments)
// })