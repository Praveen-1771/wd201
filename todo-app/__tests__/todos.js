const request = require("supertest");

const db = require("../models/index");
const app = require("../app");

let server, agent;

describe("Todo Application", function () {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
    server = app.listen(3000, () => {});
    agent = request.agent(server);
  });

  afterAll(async () => {
    try {
      await db.sequelize.close();
      await server.close();
    } catch (error) {
      console.log(error);
    }
  });

  test("Creates a todo and responds with json at /todos POST endpoint", async () => {
    const response = await agent.post("/todos").send({
      title: "Buy milk",
      dueDate: new Date().toISOString(),
      completed: false,
    });
    expect(response.statusCode).toBe(200);
    expect(response.header["content-type"]).toBe(
      "application/json; charset=utf-8"
    );
    const parsedResponse = JSON.parse(response.text);
    expect(parsedResponse.id).toBeDefined();
  });

  test("Marks a todo with the given ID as complete", async () => {
    const response = await agent.post("/todos").send({
      title: "Buy milk",
      dueDate: new Date().toISOString(),
      completed: false,
    });
    const parsedResponse = JSON.parse(response.text);
    const todoID = parsedResponse.id;

    expect(parsedResponse.completed).toBe(false);

    const markCompleteResponse = await agent
      .put(`/todos/${todoID}/markASCompleted`)
      .send();
    const parsedUpdateResponse = JSON.parse(markCompleteResponse.text);
    expect(parsedUpdateResponse.completed).toBe(true);
  });

  test("Fetches all todos in the database using /todos endpoint", async () => {
    await agent.post("/todos").send({
      title: "Buy xbox",
      dueDate: new Date().toISOString(),
      completed: false,
    });
    await agent.post("/todos").send({
      title: "Buy ps3",
      dueDate: new Date().toISOString(),
      completed: false,
    });
    const response = await agent.get("/todos");
    const parsedResponse = JSON.parse(response.text);

    expect(parsedResponse.length).toBe(4);
    expect(parsedResponse[3]["title"]).toBe("Buy ps3");
  });

  test("Deletes a todo with the given ID if it exists and sends a boolean response", async () => {
    // FILL IN YOUR CODE HERE
      // Create a todo
      const createResponse = await agent.post("/todos").send({
        title: "To be deleted",
        dueDate: new Date().toISOString(),
        completed: false,
      });
      const createdTodo = JSON.parse(createResponse.text);
    
      // Get the ID of the created todo
      const todoID = createdTodo.id;
    
      // Delete the todo
      const deleteResponse = await agent.delete(`/todos/${todoID}`);
      
      // Check the response
      expect(deleteResponse.statusCode).toBe(200);
      expect(deleteResponse.header["content-type"]).toBe(
        "application/json; charset=utf-8"
      );
      const parsedDeleteResponse = JSON.parse(deleteResponse.text);
      
      // Ensure the response contains a boolean indicating successful deletion
      expect(parsedDeleteResponse.success).toBe(true);
    
      // Optional: Verify that the todo is no longer present in the database
      const fetchAfterDelete = await agent.get("/todos");
      const parsedFetchAfterDelete = JSON.parse(fetchAfterDelete.text);
      const deletedTodo = parsedFetchAfterDelete.find(todo => todo.id === todoID);
      expect(deletedTodo).toBeUndefined();
    });
    
  
});