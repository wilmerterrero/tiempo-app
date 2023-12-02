import { IndexedDBProps } from "react-indexed-db-hook";

export const DBConfig: IndexedDBProps = {
  name: "TiempoDB",
  version: 2,
  objectStoresMeta: [
    {
      store: "timezones",
      storeConfig: { keyPath: "id", autoIncrement: true },
      storeSchema: [
        {
          name: "name",
          keypath: "name",
          options: { unique: false },
        },
        {
          name: "timezone",
          keypath: "timezone",
          options: { unique: false },
        },
        {
          name: "isFavorite",
          keypath: "isFavorite",
          options: { unique: false },
        },
        { name: "offSet", keypath: "offSet", options: { unique: false } },
        { name: "order", keypath: "order", options: { unique: false } },
      ],
    },
  ],
};
