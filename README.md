# MyDataShare Dashboard

## Overview

Dashboard is a tool for customers to manage the MyDataShare assets owned by their organization.

Dashboard provides the following features: 

- Authentication of the user
- Creation, editing and deletion of data consumer, data provider and access gateway entities
- Creation of processing records either individually or based on group membership 
- Creation of support requests (e.g. new clients or sub-organizations) 
- Management of organizational users 

In order to utilize Dashboard against the MyDataShare test environment, you must obtain the client credentials from the MyDataShare administrators

## Architecture

### User login and general API use sequence diagram 

```mermaid
sequenceDiagram
    %% Login
    rect rgb(235, 244, 252)
    note right of User: Login and<br/>organization select
    User->>Dashboard: Log in
    activate User
    activate Dashboard
    Dashboard->>IdP: Auth (scope: organization dashboard)
    IdP-->>Dashboard: O-D token

    %% Organization select
    Dashboard->>MOP: Fetch Identifiers [O-D token]<br/>POST /organization/identifiers<br/>[No query params]
    MOP-->>Dashboard: OrganizationIdentifiers
    note right of Dashboard: TODO: Save only UUIDs, no<br/>sensitive data (MDP2-1313)
    Dashboard->>Dashboard: Save Identifiers and Organizations to LocalStorage
    Dashboard-->>User: Show available organizations
    User->>Dashboard: Select organization
    Dashboard-->>User: Logged in with selected organization
    end

    %% User logged in status poll
    rect rgb(232, 250, 237)
    loop Poll Identifiers endpoint in background
        note right of Dashboard: The identifiers endpoint is refetched<br/>periodically so that we can react<br/>if the user session ends or<br/>organization affiliations change.
        Dashboard->>MOP: Fetch identifiers [O-D token]<br/>POST /organization/identifiers<br/>[No query params]
        MOP-->>Dashboard: OrganizationIdentifiers
        note right of Dashboard:
        Dashboard->>Dashboard: Save Identifiers and Organizations to LocalStorage
    end
    end

    %% List, view and edit a resource
    rect rgb(250, 232, 232)
    note right of User: List, view and edit a resource
    User->>Dashboard: Show DataProviders
    Dashboard->>MOP: Fetch DataProviders [O-D token]<br/>POST /organization/data_providers<br/>[Params: organization_uuid, identifier_uuid]
    MOP-->>Dashboard: DataProviders
    Dashboard-->>User: Show list of DataProviders
    User->>Dashboard: Create DataProvider
    Dashboard->>MOP: Create DataProvider [O-D token]<br/>POST /organization/data_provider<br/>[Params: organization_uuid, identifier_uuid]
    MOP-->>Dashboard: DataProvider
    Dashboard-->>User: DataProvider
    User->>Dashboard: View a DataProvider
    Dashboard->>MOP: Fetch DataProvider [O-D token]<br/>GET /organization/data_provider<br/>[Params: organization_uuid, identifier_uuid]
    MOP-->>Dashboard: DataProvider
    Dashboard-->>User: Show DataProvider
    User->>Dashboard: Edit DataProvider
    Dashboard->>MOP: Modify DataProvider [O-D token]<br/>PATCH /organization/data_provider<br/>[Params: organization_uuid, identifier_uuid]
    MOP-->>Dashboard: Modified DataProvider
    opt If modify OK and Metadatas were edited
        par Modify Metadata
            Dashboard->>MOP: Modify Metadata [O-D token]<br/>PATCH /organization/metadata<br/>[Params: organization_uuid, identifier_uuid]
        and Create Metadata
            Dashboard->>MOP: Create Metadata [O-D token]<br/>POST /organization/metadata<br/>[Params: organization_uuid, identifier_uuid]
        and Delete Metadata
            Dashboard->>MOP: Delete Metadata [O-D token]<br/>DELETE /oraganization/metadata<br/>[Params: organization_uuid, identifier_uuid]
        end
    end
    Dashboard-->>User: Modified DataProvider
    User->>Dashboard: Delete DataProvider
    Dashboard->>MOP: Delete DataProvider [O-D token]<br/>DELETE /organization/data_provider<br/>[Params: organization_uuid, identifier_uuid]
    MOP-->>Dashboard: 200 OK
    Dashboard-->>User: Deleted DataProvider
    end

    deactivate Dashboard
    deactivate User
```

## Configuration 

Dashboard configuration settings are controlled using environment variables.

### `REACT_APP_IDP_CLIENT_ID` (required*)

**Example: `REACT_APP_IDP_CLIENT_ID`: `some-dashboard-client-id`**

### `REACT_APP_MDS_API_URL` (required)

**Example: `https://api.beta.mydatashare.com`**

Base URL for the MDS API to use.

### `REACT_APP_AUTH_ITEM_NAMES` (required)

**Example: `Log in with a randomly generated user;Log in with a test user`**

A semicolon separated list of MDS API AuthItems to display as login methods specified by their `name` field.

## Development 

### Running via Docker Image

Starting a clean environment:

```
docker-compose up --build devserver
```
