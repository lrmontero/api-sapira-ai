export interface OdooConnection {
	id: string;
	url: string;
	database_name: string;
	username: string;
	api_key: string;
	holding_id: string;
}

export interface SignerInfo {
	signerId: string;
	placeholderName: string;
	placeholderIndex: number;
	byteRange: number[];
	documentHash: string;
}

export interface SyncResult {
	success: boolean;
	message: string;
	invoicesSynced: number;
	linesSynced: number;
	partnersSynced: number;
	errors: number;
	batchId: string;
	totalProcessed: number;
	stats: {
		saved_invoices: number;
		saved_lines: number;
		saved_partners: number;
		errors: number;
	};
}

export interface EstimateResult {
	success: boolean;
	total_lines: number;
	total_invoices: number;
	lines_per_invoice: number;
	total_invoices_without_product_lines: number;
	invoices_without_product_lines_names: string[];
	message: string;
}

export interface XmlRpcResponse {
	methodResponse?: {
		fault?: {
			value: any;
		};
		params?: {
			param?: {
				value: any;
			};
		};
	};
}

export interface OdooInvoice {
	id: number;
	name: string;
	display_name: string;
	move_type: string;
	state: string;
	partner_id: [number, string];
	commercial_partner_id: [number, string];
	invoice_date: string;
	invoice_date_due: string;
	date: string;
	amount_untaxed: number;
	amount_tax: number;
	amount_total: number;
	amount_residual: number;
	currency_id: [number, string];
	company_currency_id: [number, string];
	invoice_origin: string;
	ref: string;
	narration: string;
	payment_reference: string;
	invoice_line_ids: number[];
	line_ids: number[];
	journal_id: [number, string];
	company_id: [number, string];
	create_date: string;
	write_date: string;
	create_uid: [number, string];
	write_uid: [number, string];
	invoice_user_id: [number, string];
	user_id: [number, string];
	team_id: [number, string];
	invoice_payment_term_id: [number, string];
	fiscal_position_id: [number, string];
	payment_state: string;
	invoice_payments_widget: any;
}

export interface OdooInvoiceLine {
	id: number;
	move_id: [number, string];
	name: string;
	display_name: string;
	sequence: number;
	product_id: [number, string];
	product_uom_id: [number, string];
	quantity: number;
	price_unit: number;
	price_subtotal: number;
	price_total: number;
	discount: number;
	tax_base_amount: number;
	account_id: [number, string];
	tax_ids: number[];
	tax_line_id: [number, string];
	partner_id: [number, string];
	currency_id: [number, string];
	create_date: string;
	write_date: string;
	display_type: string;
}

export interface OdooPartner {
	id: number;
	name: string;
	display_name: string;
	ref: string;
	active: boolean;
	email: string;
	phone: string;
	mobile: string;
	website: string;
	email_normalized: string;
	phone_sanitized: string;
	street: string;
	street2: string;
	city: string;
	zip: string;
	state_id: [number, string];
	country_id: [number, string];
	contact_address_complete: string;
	vat: string;
	commercial_partner_id: [number, string];
	is_company: boolean;
	company_type: string;
	category_id: number[];
	industry_id: [number, string];
	function: string;
	title: [number, string];
	create_date: string;
	write_date: string;
	create_uid: [number, string];
	write_uid: [number, string];
	supplier_rank: number;
	customer_rank: number;
	user_id: [number, string];
	team_id: [number, string];
	property_payment_term_id: [number, string];
	l10n_cl_activity_description: string;
	lang: string;
	tz: string;
}
