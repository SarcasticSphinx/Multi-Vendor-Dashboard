'use client';
import React, { useEffect, useState } from "react";

// Define the type for a single selected item
interface SelectedItem {
  name: string;
  price: number;
  // Add any other properties your items might have
}

const CheckOutPage: React.FC = () => {
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [customerId, setCustomerId] = useState<string | null>(null);

  useEffect(() => {
    // This code block will only execute on the client-side,
    // where the 'window' object is defined.
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);

      // Get 'selectedItems' from URL, parse it, and ensure it's an array of SelectedItem
      const itemsParam = searchParams.get("selectedItems");
      let parsedItems: SelectedItem[] = [];
      if (itemsParam) {
        try {
          // Decode the URI component and parse the JSON string
          parsedItems = JSON.parse(decodeURIComponent(itemsParam)) as SelectedItem[];
        } catch (error) {
          console.error("Error parsing selectedItems from URL:", error);
          // Handle parsing error, e.g., set to empty array or show a message
          parsedItems = [];
        }
      }

      // Get 'customerId' from URL
      const customerIdParam = searchParams.get("customerId");

      // Update the state with the retrieved values
      setSelectedItems(parsedItems);
      setCustomerId(customerIdParam);

      console.log("Selected Items:", parsedItems);
      console.log("Customer ID:", customerIdParam);
    }
  }, []); // The empty dependency array ensures this effect runs only once after the initial render

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Checkout Summary</h1>

        <div className="mb-6">
          <p className="text-lg text-gray-700">
            <span className="font-semibold">Customer ID:</span> {customerId || "N/A"}
          </p>
        </div>

        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Selected Items:</h2>
        {selectedItems.length > 0 ? (
          <ul className="space-y-3">
            {selectedItems.map((item, index) => (
              <li key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded-md shadow-sm">
                <span className="text-gray-900 font-medium">{item.name}</span>
                <span className="text-green-600 font-bold">${item.price.toFixed(2)}</span>
              </li>
            ))}
            <li className="flex justify-between items-center bg-blue-100 p-3 rounded-md font-bold text-blue-800 text-xl mt-4">
                <span>Total:</span>
                <span>${selectedItems.reduce((sum, item) => sum + item.price, 0).toFixed(2)}</span>
            </li>
          </ul>
        ) : (
          <p className="text-gray-600 text-center py-4">No items selected for checkout.</p>
        )}

        <button
          className="mt-8 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-lg"
          onClick={() => alert('Proceeding to payment... (This is a placeholder)')}
        >
          Proceed to Payment
        </button>
      </div>
    </div>
  );
};

export default CheckOutPage;
