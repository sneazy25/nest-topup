# Nest Topup Service

A feature-rich **NestJS** service for Games top-ups. This service integrates with multiple top-up providers and allows easy extension for additional providers. Designed with a modular architecture, it supports customization and scalability, making it suitable for both small and large-scale applications.

## Features

- **Provider Integration**: Easily integrate with multiple top-up providers through configurable modules. Currently using [API Games](https://apigames.id/) for top-up games provider. And [Duitku](https://www.duitku.com/payment-gateway/) for payment gateway provider.
- **Transaction Management**: Track and manage top-up transactions with comprehensive logging.
- **Authentication**: Secure API endpoints using JWT authentication.
- **Role-Based Access Control**: Assign roles to manage access to specific endpoints.
- **Error Handling**: Robust error handling to ensure smooth user experience and logging.
- **Customizable**: Easily add or modify providers with minimal changes to the existing structure.
- **Modular Architecture**: Clean, scalable codebase following best practices for NestJS projects.
## Getting Started

### Prerequisites

- **Node.js** >= 14.x
- **NestJS** >= 7.x
- **PostgreSQL** (or another supported database)
- **PrismaORM** (for database interactions)
- **Redis** (optional for caching, but recommended)


## Installation

1. Clone the repository:

```bash
git clone https://github.com/vortex-byte/nest-topup.git
cd nest-topup
```

2. Install dependencies:

```bash
npm install
```

3. Configure environment variables:

Create a `.env` file in the root directory and define the following variables:

```bash
APP_NAME=
APP_HOST=
DATABASE_URL=
JWT_SECRET=
ENCRYPT_SECRET= # secret key for refund signature

DUITKU_DOMAIN=
DUITKU_API_KEY=
DUITKU_MERCHANT_CODE=
DUITKU_CALLBACK_URL=

APIGAMES_DOMAIN=
APIGAMES_API_KEY=
APIGAMES_MERCHANT_CODE=
REFUND_FORM_URL=

EMAIL_HOST=
EMAIL_PORT=
EMAIL_USERNAME=
EMAIL_PASSWORD=

REDIS_HOST=
REDIS_PORT=
REDIS_PASSWORD=
REDIS_DB=
```

4. Run database migrations:

```bash
npx prisma migrate dev --name init
```

5. Start the application:

For production mode

```bash
npm run start
```

For development mode

```bash
npm run start:dev
```
## API Reference

Postman collection documentation is available at [API Documentation](https://documenter.getpostman.com/view/26330471/2sAXxP8sLC)


## Contributing

Contributions are welcome! Feel free to submit a pull request or open an issue for any feature requests or bugs.


## Authors

- [@vortex-byte](https://www.github.com/vortex-byte)

