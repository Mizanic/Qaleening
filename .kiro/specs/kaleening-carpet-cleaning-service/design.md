# Design Document - Kaleening Carpet Cleaning Service

## Overview

Kaleening is a mobile-first platform that connects mosques with professional carpet cleaning services. The system follows a role-based architecture with three primary user types: regular users, Single Points of Contact (SPOCs), and administrators. The platform emphasizes security, mobile optimization, and streamlined workflow management for mosque carpet cleaning coordination.

## Architecture

### System Architecture

The application follows a client-server architecture with the following components:

-   **Mobile Client**: React Native application for iOS and Android
-   **Backend API**: RESTful API service handling business logic and data management using API GW + Lambda
-   **Database**: Relational database for persistent data storage
-   **Authentication Service**: JWT-based authentication with email verification using cognito
-   **Notification Service**: Push notifications and in-app messaging
-   **File Storage**: Cloud storage for mosque photos and documents
-   **Maps Integration**: Google Maps API for location services

### Technology Stack

-   **Frontend**: React Native with TypeScript
-   **Backend**: Node.js with Express.js or Python with FastAPI
-   **Database**: PostgreSQL with spatial extensions for location data
-   **Authentication**: JWT tokens with refresh token rotation
-   **File Storage**: AWS S3 or similar cloud storage
-   **Push Notifications**: Firebase Cloud Messaging (FCM)
-   **Maps**: Google Maps API

## Components and Interfaces

### User Management Component

Handles user registration, authentication, and profile management.

**Key Interfaces:**

-   `IUserService`: User CRUD operations and authentication
-   `IAuthService`: Token management and verification
-   `IVerificationService`: Email/phone verification handling

**Design Decisions:**

-   JWT tokens with short expiration (15 minutes) and refresh tokens for security
-   Support for both email and phone number registration to accommodate user preferences
-   Verification codes expire after 10 minutes to balance security and usability

### Mosque Management Component

Manages mosque information, registration, and approval workflows.

**Key Interfaces:**

-   `IMosqueService`: Mosque CRUD operations and approval workflows
-   `ILocationService`: Google Maps integration and coordinate validation
-   `IImageService`: Photo upload and management

**Design Decisions:**

-   Mosque approval workflow prevents unauthorized locations from being added
-   Google Maps integration ensures accurate location data for cleaning service navigation
-   Separate tracking of carpet area per floor accommodates multi-story mosques
-   Photo storage supports multiple images per mosque for better service planning

### Authorization and SPOC Management Component

Handles Single Point of Contact authorization and role management.

**Key Interfaces:**

-   `ISPOCService`: SPOC request and approval management
-   `IAuthorizationService`: Role-based access control
-   `IApprovalWorkflowService`: Generic approval workflow handling

**Design Decisions:**

-   SPOC authorization requires existing SPOC or admin approval to maintain security
-   Multiple SPOCs per mosque allowed for redundancy and flexibility
-   Role-based permissions ensure only authorized users can perform sensitive actions
-   Approval workflow is reusable for both mosque and SPOC approvals

### Appointment Management Component

Manages cleaning appointment requests, scheduling, and lifecycle.

**Key Interfaces:**

-   `IAppointmentService`: Appointment CRUD and workflow management
-   `ISchedulingService`: Date/time management and conflict resolution
-   `INotificationService`: Status change notifications

**Design Decisions:**

-   Appointment requests require SPOC authorization to prevent unauthorized bookings
-   Admin approval workflow ensures proper resource allocation and scheduling
-   Flexible scheduling accommodates mosque preferences and cleaning service availability
-   Status tracking provides clear visibility into appointment lifecycle

### Administrative Functions Component

Provides comprehensive management tools for platform administrators.

**Key Interfaces:**

-   `IAdminService`: Administrative operations and oversight
-   `IAuditService`: Activity logging and audit trail
-   `IReportingService`: System analytics and reporting

**Design Decisions:**

-   Centralized admin dashboard for efficient platform management
-   Comprehensive audit logging for security and compliance
-   Role separation between regular admins and super admins for enhanced security
-   Bulk operations support for efficient management of multiple requests

### Mobile User Interface Component

Provides responsive and intuitive mobile experience.

**Key Interfaces:**

-   `INavigationService`: Screen navigation and routing
-   `IOfflineService`: Data caching and synchronization
-   `IMapService`: Location display and navigation integration

**Design Decisions:**

-   Mobile-first design ensures optimal touch interface experience
-   Offline capability maintains functionality during connectivity issues
-   Native map integration provides seamless navigation to mosque locations
-   Progressive loading reduces initial app load time

## Data Models

### User Model

```typescript
interface User {
    id: string;
    email?: string;
    phoneNumber?: string;
    passwordHash: string;
    isVerified: boolean;
    role: "user" | "admin";
    createdAt: Date;
    updatedAt: Date;
}
```

### Mosque Model

```typescript
interface Mosque {
    id: string;
    name: string;
    address: string;
    coordinates: {
        latitude: number;
        longitude: number;
    };
    carpetArea: number;
    numberOfFloors: number;
    floorDetails?: FloorDetail[];
    photos: string[];
    isApproved: boolean;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

interface FloorDetail {
    floorNumber: number;
    carpetArea: number;
    description?: string;
}
```

### SPOC Authorization Model

```typescript
interface SPOCAuthorization {
    id: string;
    userId: string;
    mosqueId: string;
    status: "pending" | "approved" | "rejected";
    requestedAt: Date;
    approvedBy?: string;
    approvedAt?: Date;
    rejectionReason?: string;
}
```

### Appointment Model

```typescript
interface Appointment {
    id: string;
    mosqueId: string;
    requestedBy: string;
    preferredDates: Date[];
    specialRequirements?: string;
    status: "pending" | "scheduled" | "completed" | "cancelled";
    scheduledDate?: Date;
    scheduledBy?: string;
    completedAt?: Date;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}
```

## Error Handling

### Error Categories

1. **Authentication Errors**: Invalid credentials, expired tokens, unverified accounts
2. **Authorization Errors**: Insufficient permissions, unauthorized access attempts
3. **Validation Errors**: Invalid input data, missing required fields
4. **Business Logic Errors**: Duplicate requests, invalid state transitions
5. **External Service Errors**: Maps API failures, notification service issues
6. **System Errors**: Database connectivity, server errors

### Error Response Strategy

-   Consistent error response format across all API endpoints
-   User-friendly error messages for client-side display
-   Detailed error logging for debugging and monitoring
-   Graceful degradation for non-critical service failures
-   Retry mechanisms for transient failures

### Offline Handling

-   Local data caching for essential information
-   Queue pending actions for sync when connectivity returns
-   Clear offline indicators in the mobile interface
-   Conflict resolution for data synchronization

## Testing Strategy

### Unit Testing

-   Service layer testing with mocked dependencies
-   Data model validation testing
-   Utility function testing
-   Authentication and authorization logic testing

### Integration Testing

-   API endpoint testing with real database
-   External service integration testing (Maps, notifications)
-   Database transaction testing
-   File upload and storage testing

### End-to-End Testing

-   Complete user registration and verification flow
-   Mosque addition and approval workflow
-   SPOC authorization process
-   Appointment request and scheduling flow
-   Admin management operations

### Mobile Testing

-   Cross-platform testing (iOS and Android)
-   Device-specific testing (various screen sizes)
-   Offline functionality testing
-   Push notification testing
-   Performance testing under various network conditions

### Security Testing

-   Authentication bypass attempts
-   Authorization escalation testing
-   Input validation and SQL injection testing
-   Token security and expiration testing
-   Data encryption verification

### Performance Testing

-   API response time testing
-   Database query optimization
-   Mobile app startup time
-   Large dataset handling
-   Concurrent user load testing

## Security Considerations

### Authentication Security

-   Password hashing using bcrypt with appropriate salt rounds
-   JWT token security with short expiration times
-   Refresh token rotation to prevent token replay attacks
-   Account lockout after multiple failed login attempts

### Data Protection

-   Encryption at rest for sensitive data
-   HTTPS/TLS for all API communications
-   Input sanitization and validation
-   SQL injection prevention through parameterized queries

### Authorization Security

-   Role-based access control with principle of least privilege
-   Resource-level permissions for mosque and appointment access
-   Admin action logging and audit trails
-   Session management and timeout handling

### Mobile Security

-   Certificate pinning for API communications
-   Secure storage for authentication tokens
-   Biometric authentication support where available
-   App integrity verification
