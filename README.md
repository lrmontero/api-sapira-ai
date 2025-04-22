# API SAEIA - Sistema de Administración Educacional e Inteligencia Artificial

<p align="center">
  <img src="https://www.mineduc.cl/wp-content/uploads/sites/19/2018/01/logo-gobierno-chile-mineduc.jpg" width="400" alt="Ministerio de Educación Logo" />
</p>

<p align="center">
  <img src="https://www.syscode.cl/wp-content/uploads/2022/08/logo-syscode.png" width="200" alt="Syscode Logo" />
</p>

## Descripción

API SAEIA es un backend desarrollado por **Syscode** para el **Ministerio de Educación de Chile**. Este sistema proporciona servicios para la administración educacional utilizando tecnologías modernas e inteligencia artificial.

Este proyecto está desarrollado con [NestJS](https://nestjs.com/), un framework progresivo de Node.js para construir aplicaciones del lado del servidor eficientes y escalables.

## Información del Proyecto

- **Nombre:** saeia-api
- **Versión:** 0.0.1
- **Autor:** Syscode
- **Licencia:** Propietaria - Todos los derechos reservados

> **NOTA IMPORTANTE**: Este software es propiedad de Syscode y ha sido desarrollado exclusivamente para el Ministerio de Educación de Chile. Cualquier uso, reproducción o distribución no autorizada está estrictamente prohibida.

## Requisitos Técnicos

```bash
# Versiones requeridas
Node.js: v21.6.2 o superior
npm: v10.2.4 o superior
yarn: v4.4.0 o superior
```

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
