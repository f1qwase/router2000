[
	{
		name: "abstractCommand", // уникальное имя
		noOutputData: true, // true/false возвращает ли данные

		//optional members
		description: "command description", // описание команды
		outputDataDescription: "type of output data", //описание результата
		arguments: [ // данные, поступающие на вход блока. они же аргументы команды.
			"argument_1",
			"argument_2"
		],
		parameters: [ //имена параметра, используемого при вызове блока. см блок ask
			"p1",
			"p 2" 
		]

		// что-то еще с обработкой ошибок надо придумать
	},
	{
		name: "get my IP",
		noOutputData: false,
		description: "get clients IP",
		outputDataDescription: "IP"
	},
	{
		name: "getWanName",
		noOutputData: false,
		description: "get name of global interface",
		outputDataDescription: "wan name"
	},
	{
		name: "get dhcp table",
		description: "get DHCP table in array",
		noOutputData: false,
		outputDataDescription: "DHCP table"
	},
	{
		name: "ask",
		noOutputData: false,
		description: "shows dialog with question",
		parameters: [
			"variable"
		],
		outputDataDescription: "variable" // не очень красиво получается
	},
	{
		name: "fixIp",
		noOutputData: true,
		description: "link ip with mac",
		arguments: [
			"name", // хорошо бы сделать необязательным
			"ip",
			"mac"
		]
	}
]