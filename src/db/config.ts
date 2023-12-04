import { IndexedDBProps } from "react-indexed-db-hook";

export const DBConfig: IndexedDBProps = {
  name: "TiempoAppDB",
  version: 1,
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
        {
          name: "extraColumn1",
          keypath: "extraColumn1",
          options: { unique: false },
        },
        {
          name: "extraColumn2",
          keypath: "extraColumn2",
          options: { unique: false },
        },
        {
          name: "extraColumn3",
          keypath: "extraColumn3",
          options: { unique: false },
        },
        {
          name: "extraColumn4",
          keypath: "extraColumn4",
          options: { unique: false },
        },
        {
          name: "extraColumn5",
          keypath: "extraColumn5",
          options: { unique: false },
        },
        {
          name: "extraColumn6",
          keypath: "extraColumn6",
          options: { unique: false },
        },
      ],
    },
  ],
};
