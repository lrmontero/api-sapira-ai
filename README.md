# API Sapi - Gestión de Ingresos Recurrentes para SaaS

## Descripción

API Sapi es un backend robusto diseñado para gestionar ingresos recurrentes de empresas SaaS. Esta aplicación proporciona servicios completos para el manejo de suscripciones, facturación automatizada, métricas de ingresos y análisis de retención de clientes.

Este proyecto está desarrollado con [NestJS](https://nestjs.com/), un framework progresivo de Node.js para construir aplicaciones del lado del servidor eficientes y escalables.

## Información del Proyecto

- **Nombre:** sapi-api
- **Versión:** 1.0.0
- **Descripción:** API para gestión de ingresos recurrentes SaaS
- **Autor:** León Montero
- **Licencia:** MIT

## Características Principales

- 🔄 **Gestión de Suscripciones**: Manejo completo del ciclo de vida de suscripciones
- 💰 **Facturación Automatizada**: Generación automática de facturas y cobros recurrentes
- 📊 **Métricas de Ingresos**: Análisis detallado de MRR, ARR, churn rate y LTV
- 🔐 **Autenticación Segura**: Integración con Azure B2C y MSAL
- 📈 **Analytics Avanzados**: Reportes y dashboards de performance financiera
- 🔔 **Notificaciones**: Sistema de alertas para eventos críticos del negocio

## Stack Tecnológico

- **Framework:** NestJS 14+
- **Lenguaje:** TypeScript 5.6.2
- **Runtime:** Node.js 22.14+
- **Gestor de Paquetes:** Yarn 4.5.1
- **Base de Datos:** MongoDB
- **Autenticación:** Azure B2C + MSAL
- **Monitoreo:** Application Insights
- **CI/CD:** GitHub Actions + Docker

## Instalación

```bash
# Instalar dependencias
$ yarn install
```

## Configuración

El proyecto requiere un archivo `.env` con las configuraciones necesarias. Puede usar `.env.example` como plantilla:

```bash
# Copiar archivo de ejemplo
$ cp .env.example .env
# Editar con los valores correspondientes
$ nano .env
```

## Ejecución

```bash
# Modo desarrollo
$ yarn start:dev

# Modo producción
$ yarn build
$ yarn start:prod
```

## Pruebas

```bash
# Pruebas unitarias
$ yarn test

# Pruebas e2e
$ yarn test:e2e

# Cobertura de pruebas
$ yarn test:cov
```

## Características Principales

- Autenticación y autorización con Azure AD B2C
- Integración con Microsoft Graph API
- Sistema de perfiles y workspaces
- Gestión de usuarios y roles
- Telemetría con Application Insights
- Documentación API con Swagger

## Estructura del Proyecto

```
src/
├── auth/               # Autenticación y estrategias
├── databases/          # Configuración de bases de datos
├── decorators/         # Decoradores personalizados
├── events/             # Sistema de eventos
├── health/             # Endpoints de salud
├── interceptors/       # Interceptores
├── logger/             # Configuración de logging
├── middlewares/        # Middlewares
├── modules/            # Módulos de la aplicación
│   ├── profiles/       # Gestión de perfiles
│   ├── utils/          # Utilidades
│   │   └── msgraph/    # Integración con Microsoft Graph
│   └── workspaces/     # Gestión de workspaces
└── telemetry/          # Configuración de telemetría
```

## Documentación API

La documentación de la API está disponible a través de Swagger UI en la ruta `/api` cuando la aplicación está en ejecución.

## Soporte

Para soporte técnico, contacte a Syscode:

- **Email:** soporte@syscode.cl
- **Web:** [www.syscode.cl](https://www.syscode.cl)

---

© 2025 Syscode. Desarrollado para el Ministerio de Educación de Chile. Todos los derechos reservados.
