const express = require("express");
const mysql = require("mysql2");
const axios = require("axios");
const app = express();
app.use(express.json());

const CRM_API_URL =
  "https://tcetmumbai.myfreshworks.com/crm/sales/api/contacts";

const mysqlConnection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "sahil@123",
  database: "freshsales",
});

mysqlConnection.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL database: " + err.stack);
    return;
  }
  console.log("Connected to MySQL database as id " + mysqlConnection.threadId);
});

// Create Contact
app.post("/createContact", async (req, res) => {
  try {
    // Implement logic to create contact in CRM and SQL database
    // Omitted for brevity
  } catch (error) {
    console.error("Error creating contact:", error.response.data);
    res.status(500).json({ error: "Failed to create contact" });
  }
});

// Get Contact
app.get("/getContact", async (req, res) => {
  try {
    const { contact_id, data_store } = req.query;

    if (!contact_id || !data_store) {
      return res.status(400).json({ error: "Missing parameters" });
    }

    if (data_store === "CRM") {
      // Make API request to CRM to get contact details
      const response = await axios.get(
        `${CRM_API_URL}/${contact_id}?include=sales_accounts`,
        {
          headers: {
            Authorization: "Token SbfMdBeXcgpyuS8oeu9Gwg",
            "Content-Type": "application/json",
          },
        }
      );

      // Extract only required fields from the CRM response
      const { id, first_name, last_name, email, mobile_number } =
        response.data.contact;

      // Construct a new object with the required fields
      const contact = { id, first_name, last_name, email, mobile_number };

      res.json({ message: "Contact retrieved from CRM", contact });
    } else if (data_store === "DATABASE") {
      // Query database to get contact details
      const query = "SELECT * FROM contacts WHERE id = ?";
      mysqlConnection.query(query, [contact_id], (err, result) => {
        if (err) {
          console.error("Error getting contact from database: " + err.stack);
          res
            .status(500)
            .json({ error: "Error getting contact from database" });
          return;
        }
        if (result.length === 0) {
          res.status(404).json({ error: "Contact not found" });
          return;
        }
        const contact = result[0];
        res.json({ message: "Contact retrieved from database", contact });
      });
    } else {
      res.status(400).json({ error: "Invalid data_store parameter" });
    }
  } catch (error) {
    console.error("Error retrieving contact:", error.response.data);
    res.status(500).json({ error: "Failed to retrieve contact" });
  }
});

// Update Contact
app.post("/updateContact", async (req, res) => {
  try {
    const { contact_id, new_email, new_mobile_number, data_store } = req.body;

    if (!contact_id || !new_email || !new_mobile_number || !data_store) {
      return res.status(400).json({ error: "Missing parameters" });
    }

    if (data_store === "CRM") {
      // Make API request to CRM to update contact details
      const response = await axios.put(
        `${CRM_API_URL}/${contact_id}`,
        {
          contact: {
            email: new_email,
            mobile_number: new_mobile_number,
          },
        },
        {
          headers: {
            Authorization: "Token SbfMdBeXcgpyuS8oeu9Gwg",
            "Content-Type": "application/json",
          },
        }
      );

      res.json({ message: "Contact updated in CRM" });
    } else if (data_store === "DATABASE") {
      // Update contact details in database
      const query =
        "UPDATE contacts SET email = ?, mobile_number = ? WHERE id = ?";
      mysqlConnection.query(
        query,
        [new_email, new_mobile_number, contact_id],
        (err, result) => {
          if (err) {
            console.error("Error updating contact in database: " + err.stack);
            res
              .status(500)
              .json({ error: "Error updating contact in database" });
            return;
          }
          if (result.affectedRows === 0) {
            res.status(404).json({ error: "Contact not found" });
            return;
          }
          res.json({ message: "Contact updated in database" });
        }
      );
    } else {
      res.status(400).json({ error: "Invalid data_store parameter" });
    }
  } catch (error) {
    console.error("Error updating contact:", error.response.data);
    res.status(500).json({ error: "Failed to update contact" });
  }
});

// Delete Contact
app.post("/deleteContact", async (req, res) => {
  try {
    const { contact_id, data_store } = req.body;

    if (!contact_id || !data_store) {
      return res.status(400).json({ error: "Missing parameters" });
    }

    if (data_store === "CRM") {
      // Make API request to CRM to delete contact
      const response = await axios.delete(`${CRM_API_URL}/${contact_id}`, {
        headers: {
          Authorization: "Token SbfMdBeXcgpyuS8oeu9Gwg",
          "Content-Type": "application/json",
        },
      });

      res.json({ message: "Contact deleted from CRM" });
    } else if (data_store === "DATABASE") {
      // Delete contact from database
      const query = "DELETE FROM contacts WHERE id = ?";
      mysqlConnection.query(query, [contact_id], (err, result) => {
        if (err) {
          console.error("Error deleting contact from database: " + err.stack);
          res
            .status(500)
            .json({ error: "Error deleting contact from database" });
          return;
        }
        res.json({ message: "Contact deleted from database" });
      });
    } else {
      res.status(400).json({ error: "Invalid data_store parameter" });
    }
  } catch (error) {
    console.error("Error deleting contact:", error.response.data);
    res.status(500).json({ error: "Failed to delete contact" });
  }
});

// Start the Express server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
