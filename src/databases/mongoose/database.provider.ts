import { ConfigService } from '@nestjs/config';
import * as mongoose from 'mongoose';

export const databaseProviders = [
	{
		provide: 'DbConnectionToken',
		useFactory: async (configService: ConfigService) => {
			(mongoose as any).Promise = global.Promise;

			const timezone = configService.get('TIMEZONE', 'America/Santiago');

			// Función para obtener el offset dinámicamente
			const getTimezoneOffset = (timeZone: string) => {
				const date = new Date();
				const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
				const tzDate = new Date(date.toLocaleString('en-US', { timeZone }));
				return (tzDate.getTime() - utcDate.getTime()) / 3600000; // Convertir a horas
			};

			// Plugin de timestamp
			const timestampPlugin = (schema: mongoose.Schema) => {
				if (!schema.path('createdAt')) {
					schema.add({ createdAt: Date });
				}
				if (!schema.path('updatedAt')) {
					schema.add({ updatedAt: Date });
				}

				// Pre-save middleware
				schema.pre('save', function (next) {
					const now = new Date();
					this.updatedAt = now;

					if (!this.createdAt) {
						this.createdAt = now;
					}
					next();
				});

				// Pre-update middleware
				schema.pre(['updateOne', 'findOneAndUpdate'], function (next) {
					const now = new Date();
					this.set({ updatedAt: now });
					next();
				});

				// Transformación para JSON y Object
				const transformOptions = {
					transform: function (doc, ret) {
						if (ret.createdAt) {
							const date = new Date(ret.createdAt);
							const offset = getTimezoneOffset(timezone);
							date.setHours(date.getHours() + offset);
							ret.createdAt = date.toISOString();
						}
						if (ret.updatedAt) {
							const date = new Date(ret.updatedAt);
							const offset = getTimezoneOffset(timezone);
							date.setHours(date.getHours() + offset);
							ret.updatedAt = date.toISOString();
						}
						return ret;
					},
				};

				schema.set('toJSON', transformOptions);
				schema.set('toObject', transformOptions);
			};

			// Configuración de conexión mejorada
			const mongoUri = configService.get('MONGO_CONNECTION_STRING');

			try {
				// Crear la conexión con opciones mejoradas
				const connection = await mongoose.createConnection(mongoUri, {
					autoIndex: true,
					connectTimeoutMS: 30000, // Aumentado a 30 segundos
					socketTimeoutMS: 480000,
					readPreference: 'primary',
					serverSelectionTimeoutMS: 30000, // Tiempo de selección de servidor
					heartbeatFrequencyMS: 10000, // Frecuencia de latido
					retryWrites: true,
					minPoolSize: 5, // Tamaño mínimo del pool de conexiones
					maxPoolSize: 100, // Tamaño máximo del pool de conexiones
				});

				// Eventos de conexión para monitoreo
				connection.on('connected', () => {
					console.log('Mongoose conectado exitosamente a MongoDB');
				});

				connection.on('error', (err) => {
					console.error('Error de conexión a MongoDB:', err);
				});

				connection.on('disconnected', () => {
					console.warn('Mongoose desconectado de MongoDB');
				});

				// Manejar cierre de la aplicación
				process.on('SIGINT', async () => {
					await connection.close();
					console.log('Conexión a MongoDB cerrada por terminación de la aplicación');
					process.exit(0);
				});

				// Aplicar el plugin
				connection.plugin(timestampPlugin);

				return connection;
			} catch (error) {
				console.error('Error al conectar con MongoDB:', error);
				throw error; // Re-lanzar el error para que NestJS lo maneje
			}
		},
		inject: [ConfigService],
	},
];
