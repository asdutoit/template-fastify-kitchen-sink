const schema = `
  directive @auth(
    requires: Role = ADMIN,
  ) on OBJECT | FIELD_DEFINITION

  enum Role {
    ADMIN
    USER
    UNKNOWN
  }

  type Query {
    add(x: Int, y: Int): Int
    books: [Book]
    shipwrecks: [Shipwrecks]
    notifications: [Notification]
  }

  type Mutation {
    addNotification(message: String): Notification
  }

  type Subscription {
    notificationAdded: Notification
  }

  type Book {
    title: String
    author: String
  }

  type Point {
    longitude: Float!
    latitude: Float!
  }

  type PointList {
    points: [Point!]!
  }

  type Shipwrecks {
    feature_type: String
    coordinates: [Float]
  }

  type Notification {
    id: ID!
    message: String
  }
`;

export { schema };
