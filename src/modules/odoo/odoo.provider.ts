import { Injectable } from '@nestjs/common';

import { XmlRpcClientHelper } from './helpers/xml-rpc-client.helper';

@Injectable()
export class OdooProvider {
	createXmlRpcClient(url: string): XmlRpcClientHelper {
		return new XmlRpcClientHelper(url);
	}
}
