var zyxelCom = {
	getMyIp: function() {
		return new RemoteCommand({
			name: 'whoami',
			parse: function(data) {
				// var tag = "host"
				// return $(data).find(tag)
				return '192.168.1.137'
			}
		})
	},
	getWanName: function() {
		return new RemoteCommand({
			name: 'show interface',
			parse: function(data) {
				return $(data).find('interface').filter(function() {
					return $(this).find('global').text() == 'yes'
				}).attr('name')
			}
		})
	},
	getDhcpTable: function() {
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
	},
	// ask: function() {
	// 	var args = Array.prototype.join.call(arguments, ', ') || 'ass'
	// 	var defer = $.Deferred()
	// 	setTimeout(function() {
	// 		var answer = prompt('введите через ";" следующие переметры: ' + args)
	// 		defer.resolve.apply(defer, answer.split(';'))
	// 	}, 100)
	// 	return defer
	// },
	ask: function(namedArguments, parameters) {
		return prompt(parameters[0])
	},
	fixIp: function(namedArguments) {
		var knownHost = new RemoteCommand({
			name: 'known host',
			args: namedArguments,
			parse: function() {}
		})
		var hz = new RemoteCommand({
			name: "ip dhcp host",
			args: {
				mac: namedArguments.mac,
				ip: namedArguments.ip
			},
			parse: function() {}
		})
		return $.when(knownHost, hz)
	},
	setNatOn: function() {
		return new RemoteCommand({
			name: "ip nat",
			args: {
				interface: 'Home'
			},
			parse: function(data) {
				return $(data).find("message").text() == "NAT rule added."
			}
		})
	},
	forwardSinglePort: function(namedArguments) {
		return new RemoteCommand({
			name: "ip static",
			args: {
				"interface": namedArguments.wanName,
				"protocol": namedArguments.protocol,
	            "port-mode": "single",
	            "port": namedArguments.portFrom,
	            "to-address": namedArguments.ip,
	            "to-port": namedArguments.portFrom
			},
			parse: function(data) {
				$(data).find("message").text() == "static NAT rule has been added"
			}
		})
	},
	// getMyMac: ___(function(namedArguments) {
	// 	var i = 0
	// 	var dhcpTable = namedArguments.dhcpTable
	// 	while (i < dhcpTable.length) {
	// 		if (dhcpTable[i].ip == namedArguments.ip) {
	// 			return dhcpTable[i].mac
	// 		}
	// 	}
	// 	return "fail"
	// }),
	getMyMac: function(namedArguments) {
		var i = 0
		var dhcpTable = namedArguments.dhcpTable
		while (i < dhcpTable.length) {
			if (dhcpTable[i].ip == namedArguments.ip) {
				return dhcpTable[i].mac
			}
			i++
		}
	},
	// fixIp2: ___(function() {
	// 	var dhcpTable = getDhcpTable()
	// 	// var ip = getMyIp(),
	// 	var ip = "192.168.1.34"
	// 	var mac = getMac(ip, dhcpTable)
	// 	return ___(fixIp)("defaultName", ip, mac)
	// }),
	end: function() {
		console.log("that's all, folks!")
	}
}