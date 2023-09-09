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
    photos: [Photos]
  }

  type Mutation {
    addNotification(message: String): Notification
    deletePhotos: DeletePhotos
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

  type Photos {
    href: String
    base64: String
    imagePath: String
    imageFileName: String
    imageName: String
    imageExtension: String
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

  type DeletePhotos {
    message: String
  }
`;

export { schema };
