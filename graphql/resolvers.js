const books = [
  {
    title: "The Awakening",
    author: "Kate Chopin",
  },

  {
    title: "City of Glass",
    author: "Paul Auster",
  },
];

let idCount = 1;
const notifications = [
  {
    id: idCount,
    message: "Notification message",
  },
];

const resolvers = {
  Query: {
    add: async (_, { x, y }) => x + y,
    books: () => books,
    notifications: () => notifications,
    photos: async (_parent, args, ctx) => {
      const { userInfo } = ctx;
      if (!userInfo || userInfo === null) {
        throw new Error("No user found for this Id");
      }
      return ctx.prismaForGraphQL.photos.findMany();
    },
    shipwrecks: async (_parent, args, ctx) => {
      const { userInfo } = ctx;
      if (!userInfo || userInfo === null) {
        throw new Error("No user found for this Id");
      }
      return ctx.prismaForGraphQL.shipwrecks.findMany({
        where: {
          feature_type: "Wrecks - Submerged, nondangerous",
        },
      });
    },
  },
  Mutation: {
    addNotification: async (_, { message }, { pubsub }) => {
      const id = idCount++;
      const notification = { id, message };
      notifications.push(notification);
      pubsub.publish({
        topic: "NOTIFICATION_ADDED",
        payload: { notificationAdded: notification },
      });

      return notification;
    },
  },
  Subscription: {
    notificationAdded: {
      // You can also subscribe to multiple topics at once using an array like this:
      //  pubsub.subscribe(['TOPIC1', 'TOPIC2'])
      subscribe: async (root, args, { pubsub }) =>
        await pubsub.subscribe("NOTIFICATION_ADDED"),
    },
  },
};

export { resolvers };
