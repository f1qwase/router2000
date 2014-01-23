var zyxelCom = {
	getMyIp: function() {
		return new RemoteCommand({
			name: 'whoami',
			parse: function(data) {
				return $(data).find('host').text()
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
	ask: function(namedArguments, parameters) {
		return prompt(parameters[0])
	},
	fixIp: function(namedArguments) {
		var knownHost = new RemoteCommand({
			name: 'known host',
			args: {
				mac: namedArguments.mac,
				ip: namedArguments.ip,
				name: namedArguments.name || Math.random().toString().substr(0,7)
			},
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
				"interface": namedArguments.interfaceName,
				"protocol": namedArguments.protocol,
	            "port-mode": "single",
	            "port": namedArguments.portFrom,
	            "to-address": namedArguments.ipTo,
	            "to-port": namedArguments.portTo || namedArguments.portFrom
			},
			parse: function(data) {
				$(data).find("message").text() == "static NAT rule has been added"
			}
		})
	},
	getMyMac: function(namedArguments) {
		var i = 0
		var dhcpTable = namedArguments.dhcpTable
		while (i < dhcpTable.length) {
			if (dhcpTable[i].ip == namedArguments.ip) {
				return dhcpTable[i].mac
			}
			i++
		}
		return "AA:BB:CC:DD:EE:01"
	},
	end: function() {
		console.log("that's all, folks!")
	}
}