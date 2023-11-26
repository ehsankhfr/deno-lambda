import { client } from "./client.ts";
import { TableName } from "./api/candidate.ts";

export async function test(t: Deno.TestDefinition) {
  async function wrapped() {
    let err;
    await setUp();
    try {
      // deno-lint-ignore no-explicit-any
      await t.fn(undefined as any);
    } catch (e) {
      err = e;
    }
    await tearDown();
    if (err) {
      throw err;
    }
  }
  await Deno.test({ name: t.name, fn: wrapped });
}

async function setUp() {
  await client.createTable(
    {
      TableName,
      KeySchema: [{ KeyType: "HASH", AttributeName: "id" }],
      AttributeDefinitions: [{ AttributeName: "id", AttributeType: "S" }],
      ProvisionedThroughput: { ReadCapacityUnits: 1, WriteCapacityUnits: 1 },
    },
    { translateJSON: false },
  );

  await client.putItem(
    {
      TableName,
      Item: { id: { S: "abc" }, role: { S: "admin" } },
    },
    { translateJSON: false },
  );
  await client.putItem(
    {
      TableName,
      Item: { id: { S: "def" } },
    },
    { translateJSON: false },
  );
}
async function tearDown() {
  await client.deleteTable(
    {
      TableName: TableName,
    },
    { translateJSON: false },
  );
}
