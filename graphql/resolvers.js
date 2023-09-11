import axios from "axios";

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
    deletePhotos: async (_, args, ctx) => {
      const { userInfo } = ctx;
      if (!userInfo || userInfo === null) {
        throw new Error("No user found for this Id");
      }
      const deleteUrl = `${process.env.BUNNYCDN_STORAGE_LOCATION}${process.env.BUNNYCDN_STORAGE_ZONE_NAME}/`;
      let config = {
        method: "delete",
        maxBodyLength: Infinity,
        url: "https://jh.storage.bunnycdn.com/homerunner-bunny-storage/",
        headers: {
          AccessKey: "71a778a8-d391-4187-a175e027bd97-82be-4e1a",
          "Content-Type": "application/json",
        },
      };
      try {
        await axios.request(config);
        await ctx.prismaForGraphQL.photos.deleteMany();
        return { message: "Deleted all photos" };
        // }
      } catch (error) {
        console.log("error", error);
        return { message: "There was an error processing this request" };
      }
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
