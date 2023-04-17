import { IJSONSchema, JSONPrimitive, JSONArray, JSONObject } from "./interfaces/JsonSchema.interface";

export interface DynamicSchemaInterface {
  type?: JSONPrimitive | JSONArray | JSONObject;
  label?: string;
  options?: { label: string; value: string }[];
  properties?: {
    [key: string]: DynamicSchemaInterface;
  };
  [key: string]: any;
}

function generateDynamicSchemaInterface(schema: IJSONSchema): DynamicSchemaInterface {
  const dynamicSchemaInterface: DynamicSchemaInterface = {};

  Object.keys(schema).forEach((key) => {
    if (schema.hasOwnProperty(key)) {
      const property = schema[key];
      const propertyType = property.type;
      const propertyLabel = property.title || key;
      let propertyOptions;

      if (propertyType === 'string' && property.enum) {
        propertyOptions = property.enum.map((value: string) => ({
          label: value,
          value,
        }));
      }

      dynamicSchemaInterface[key] = {
        type: propertyType,
        label: propertyLabel,
        options: propertyOptions,
        ...(propertyType === 'object' && {
          properties: generateDynamicSchemaInterface(property.properties as IJSONSchema),
        }),
        ...(propertyType === 'array' && {
          properties: generateDynamicSchemaInterface(property.items as IJSONSchema),
        }),
      };
    }
  });

  return dynamicSchemaInterface;
}

export default generateDynamicSchemaInterface;
