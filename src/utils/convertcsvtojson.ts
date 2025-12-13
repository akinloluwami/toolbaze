import csv from "csvtojson"

export const csvtojson = async(csvContent : string) => {
   const jsonObj = await csv().fromString(csvContent)
   return jsonObj;
}