var scenario = {
	steps: [
		{
			id: 0,
			type: "getMyIp"
		}, {
			id: 1,
			type: "getDhcpTable"
		}, {
			id: 2,
			type: "getMyIp"
		}, {
			id: 3,
			type: "getMyMac"
		}, {
			id: 4,
			type: "fixIp"
		}, {
			id: 5,
			type: "ask",
			parameters: ["portFrom"]
		}, {
			id: 6,
			type: "ask",
			parameters: ["protocol"]
		}, {
			id: 7,
			type: "getMyIp"
		}, {
			id: 8,
			type: "getWanName"
		}, {
			id: 9,
			type: "setNatOn"
		}, {
			id: 10,
			type: "forwardSinglePort"
		}, {
			id: 11,
			type: "end",
		}
	],
	links: [
		{
			from: 1,
			to: 3,
			port: "dhcpTable"
		}, {
			from: 2,
			to: 3,
			port: "ip"
		}, {
			from: 0,
			to: 4,
			port: "ip"
		}, {
			from: 3,
			to: 4,
			port: "mac"
		}, {
			from: 4,
			to: 10,
			port: "success"
		}, {
			from: 5,
			to: 10,
			port: "portFrom"
		}, {
			from: 6,
			to: 10,
			port: "protocol"
		}, {
			from: 7,
			to: 10,
			port: "ip"
		}, {
			from: 8,
			to: 10,
			port: "wanName"
		}, {
			from: 9,
			to: 10,
			port: "success"
		}, {
			from: 10,
			to: 11,
			port: "success"
		}
	]
}