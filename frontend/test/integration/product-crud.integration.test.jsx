import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AddProductPage from "../../src/pages/product/AddProductPage";
import ViewListPage from "../../src/pages/product/ViewListPage";

beforeAll(() => {
  jest.spyOn(console, "error").mockImplementation(() => {});
});
afterAll(() => {
  console.error.mockRestore();
});

describe("Product CRUD (integration w/ fetch‑mock)", () => {
  const shopId = "shop123";
  const onCancel = jest.fn();

  beforeEach(() => {
    fetch.resetMocks();
  });

  it("creates a product then lists it", async () => {
    // 1) Mock the categories & existing products fetches:
    fetch
      // existing products → []
      .mockResponseOnce(JSON.stringify([]))
      // categories → [ { _id: 'c1', CategoryName: 'Cat1' } ]
      .mockResponseOnce(JSON.stringify([{ _id: "c1", CategoryName: "Cat1" }]))
      // POST /product → echo back new product
      .mockResponseOnce((req) => {
        const form = req.body; // a FormData
        return Promise.resolve(
          new Response(
            JSON.stringify({
              _id: "p1",
              ProductName: form.get("ProductName"),
              CategoryId: { _id: form.get("CategoryId"), CategoryName: "Cat1" },
              Description: form.get("Description"),
              ProductVariant: [],
            }),
            { status: 200 }
          )
        );
      });

    // Render the Add form and fill
    render(<AddProductPage shopId={shopId} onCancel={onCancel} />);
    fireEvent.change(screen.getByLabelText(/Product Name/i), {
      target: { value: "MyProd" },
    });
    fireEvent.change(screen.getByLabelText(/Description/i), {
      target: { value: "X".repeat(50) },
    });
    fireEvent.change(screen.getByLabelText(/Category/i), {
      target: { value: "c1" },
    });
    fireEvent.click(screen.getByText(/Add more product variant/i));
    fireEvent.change(screen.getByLabelText(/Product Variant Name/i), {
      target: { value: "V1" },
    });
    fireEvent.change(screen.getAllByRole("spinbutton")[0], {
      target: { value: "5" },
    });
    fireEvent.change(screen.getAllByRole("spinbutton")[1], {
      target: { value: "2" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Add Product/i }));

    // Wait for the onCancel (i.e. successful save)
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));

    fetch.resetMocks();

    // Stub exactly what ViewListPage will need:
    // 1) GET existing products → our new one
    // 2) (if it also fetches categories) GET categories → reuse the same
    fetch
      .mockResponseOnce(
        JSON.stringify([
          {
            _id: "p1",
            ProductName: "MyProd",
            CategoryId: { _id: "c1", CategoryName: "Cat1" },
            Description: "X".repeat(50),
            ProductImage: "",
            ProductVariant: [],
          },
        ])
      )
      // optional: categories endpoint if needed
      .mockResponseOnce(JSON.stringify([{ _id: "c1", CategoryName: "Cat1" }]));

    // Render the listing and assert our item shows up
    render(
      <ViewListPage
        shopId={shopId}
        reloadKey={Date.now()}
        onAddProduct={() => {}}
        onEditProduct={() => {}}
        onDeleteProduct={() => {}}
      />
    );
    expect(await screen.findByText("MyProd")).toBeInTheDocument();
  });

  it("updates a product by calling onEditProduct", async () => {
    // Stub list with one product:
    fetch.mockResponseOnce(
      JSON.stringify([
        {
          _id: "p2",
          ProductName: "OldName",
          CategoryId: { _id: "c1" },
          Description: "D".repeat(50),
          ProductImage: "",
          ProductVariant: [],
        },
      ])
    );

    const editMock = jest.fn();
    render(
      <ViewListPage
        shopId={shopId}
        reloadKey={0}
        onAddProduct={() => {}}
        onEditProduct={editMock}
        onDeleteProduct={() => {}}
      />
    );

    fireEvent.click(await screen.findByTitle("Edit"));
    expect(editMock).toHaveBeenCalledWith(
      expect.objectContaining({ _id: "p2" })
    );
  });

  it("deletes a product by calling onDeleteProduct", async () => {
    // Stub list with one product:
    fetch.mockResponseOnce(
      JSON.stringify([
        {
          _id: "p3",
          ProductName: "ToDelete",
          CategoryId: { _id: "c1" },
          Description: "D".repeat(50),
          ProductImage: "",
          ProductVariant: [],
        },
      ])
    );

    const deleteMock = jest.fn();
    render(
      <ViewListPage
        shopId={shopId}
        reloadKey={0}
        onAddProduct={() => {}}
        onEditProduct={() => {}}
        onDeleteProduct={deleteMock}
      />
    );

    fireEvent.click(await screen.findByTitle("Delete"));
    expect(deleteMock).toHaveBeenCalledWith("p3");
  });
});
