export const EventNames = {
	Document: {
		Process: {
			Start: 'Document.Process.Start',
			Complete: 'Document.Process.Complete',
			Error: 'Document.Process.Error',
		},
		View: {
			Start: 'Document.View.Start',
			Complete: 'Document.View.Complete',
			Error: 'Document.View.Error',
		},
		Download: {
			Start: 'Document.Download.Start',
			Complete: 'Document.Download.Complete',
			Error: 'Document.Download.Error',
		},
	},
	Auth: {
		Login: {
			Start: 'Auth.Login.Start',
			Success: 'Auth.Login.Success',
			Failure: 'Auth.Login.Failure',
		},
		Logout: {
			Success: 'Auth.Logout.Success',
		},
		DeviceChange: 'Auth.DeviceChange',
	},
	Api: {
		Call: 'Api.Call',
		Error: 'Api.Error',
	},
} as const;
