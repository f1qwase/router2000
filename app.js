// var ip = prompt('введите LAN IP своего роутера', '193.0.174.161')
var ip = '193.0.174.161'

// var proxy = function(url) {
// 	var _proxy = 'http://localhost:1337'
// 	return _proxy + '?proxy=true&src=' + url
// }

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
	type: 'command'
}
RemoteCommand.prototype.toString = function() {
	return '<' + this.type + ' name="' + this.name + '"></' + this.type + '>' //TODO this.arguments.join
}
RemoteCommand.prototype.execute = function() {
	var defer = $.Deferred()
	var that = this
	var text = '<request id="0">' + this + '</request>'
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
			console.log(data);
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
	var defer = $.Deferred()
	var args = Array.prototype.join.call(arguments, ', ') || 'ass'
	console.log('asrgsss: ', args);
	setTimeout(function() {
		console.log('aaa: ' + args);
		var answer = prompt('введите через ";" следующие переметры: ' + args)
		defer.resolve.apply(defer, answer.split(';'))
	}, 100)
	return defer
}

var fixIp = function() {

}