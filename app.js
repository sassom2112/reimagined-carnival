// Import the necessary Firestore functions from the Firebase SDK
import { getFirestore, collection, addDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Initialize Firestore
const db = getFirestore(); // Get a reference to the Firestore service
const dbRef = collection(db, "contacts"); // Get a reference to the "contacts" collection

let contacts = []; // Array to store contacts


// Function to get and log contacts from Firestore
const getContacts = async() => {
  try {
      //  const docSnap = await getDocs(dbRef);
      await onSnapshot(dbRef, (docSnap) => {
  
        contacts = []; // Clear the contacts array
  
        docSnap.forEach((doc) => {
          let contact = doc.data();
          contact.id = doc.id;
          contacts.push(contact);      
        });
        showContacts(contacts);
      });
    } catch (err) {
        console.error("Error getting documents: ", err);
      }
  };
getContacts(); // Get and log contacts from Firestore

const contactList = document.getElementById("contact-list");


const showContacts = (contacts) => {
  contactList.innerHTML = ""; // Clear the contact list

  contacts.forEach(contact => {
    // Get the initials and ensure they are capitalized
    // const initials = `${contact.firstname.charAt(0).toUpperCase()}${contact.lastname.charAt(0).toUpperCase()}`;

    const li = `
      <li class="contact-list-item" id="${contact.id}">
        <div class="media">
          <div class="two-letters">
      
          </div>
        </div>
        <div class="content">
          <div class="title">
          ${contact.firstname} ${contact.lastname}</div>
          <div class="subtitle">
          ${contact.email}</div>
        </div>
        <div class="action">
          <button class="onEdit">Edit</button>
          <button class="onDelete">DELETE</button>
        </div>
      </li>`;
    contactList.innerHTML += li; // Append the new list item to the contact list
  });
};

// -----------------------------------------
//      CLICK CONTACT LIST UL ELEMENT
// -----------------------------------------
const contactListPressed = (event) => {
  const id = event.target.closest("li").getAttribute("id");
  displayContactOnDetailsView(id);
}


contactList.addEventListener("click", contactListPressed);

// -----------------------------------------
//      DISPLAY CONTACT ON DETAILS VIEW
// -----------------------------------------
const getContact = (id) => {
  return contacts.find(contact => {
    return contact.id === id;
  });
}
const displayContactOnDetailsView = (id) => {
  const contact = getContact(id);
  const rightColDetail = document.getElementById("right-col-details");
  rightColDetail.innerHTML = `
    <div class="label">Name:</div>
    <div class="data">${contact.firstname} ${contact.lastname}</div>
    
    <div class="label">Age:</div>
    <div class="data">${contact.age}</div>

    <div class="label">Phone #:</div>
    <div class="data">${contact.phone}</div>

    <div class="label">Email:</div>
    <div class="data">${contact.email}</div>
  `;
};

// Wait for the DOM content to load before running the script
document.addEventListener("DOMContentLoaded", () => {
   // Query DOM elements
   const addBtn = document.querySelector(".addBtn"); // Button to open the add contact modal
   const modalOverlay = document.getElementById("modal-overlay"); // Overlay for the modal
   const closeBtn = document.querySelector(".closeBtn"); // Button to close the modal
   const submitBtn = document.querySelector(".submitBtn"); // Button to submit the form
   const contactList = document.getElementById("contact-list"); // Contact list element
   const error = {}; // Object to store error messages for form validation  


  // Query input elements
  const firstname = document.getElementById("firstname"),
        lastname = document.getElementById("lastname"),
        email = document.getElementById("email"),
        phone = document.getElementById("phone"),
        age = document.getElementById("age");

  // Function to check if required fields are filled
  const checkRequired = (inputArr) => {
    inputArr.forEach(input => {
        if (input.value.trim() === "") {
            setErrorMessage(input, input.id + " is required"); // Set error if the field is empty
        } else {
            deleteErrorMessage(input); // Delete error if the field is filled
        }
      });
  };

  // Function to open the modal when the add button is pressed
  const addButtonPressed = () => {
    modalOverlay.style.display = "flex"; // Show the modal overlay
  };

  // Function to close the modal when the close button is pressed
  const closeBtnPressed = () => {
    modalOverlay.style.display = "none"; // Hide the modal overlay
  };

  // Function to close the modal when clicking outside of it
  const closeWhenPressed = (e) => {
    if(e instanceof Event) {
      if (e.target === e.currentTarget) {
        modalOverlay.style.display = "none"; // Hide the modal overlay
      } 
    }  else {
        modalOverlay.style.display = "none"; // Hide the modal overlay
    }
  };

  // Function to handle form submission
  const saveButtonPressed = async() => {
    checkRequired([firstname, lastname, email, phone, age]); // Check required fields
    checkInputValue(firstname); // Validate firstname
    checkInputValue(lastname); // Validate lastname
    checkEmail(email); // Validate email
    checkInputLength(phone, 10); // Validate phone length
    checkInputLength(age, 2); // Validate age length
    showErrorMessages(); // Display error messages if any

    // If there are no errors, add the contact to Firestore
    if (Object.keys(error).length === 0) {

      try {
        await addDoc(dbRef, {
          firstname: firstname.value,
          lastname: lastname.value,
          email: email.value,
          phone: phone.value,
          age: age.value
        });
        closeWhenPressed(); // Close the modal
      } catch (err) {
        setErrorMessage("error", "Error adding document: " + err); // Set error if there is an error adding the document
        showErrorMessages(); // Display error messages if any
      }     
    }
  };

  // Function to set an error message for an input field
  const setErrorMessage = (input, message) => {
    if (input.nodeName === "INPUT") {
      error[input.id] = message; // Client Side - Add the error message to the error object
      input.style.border = "1px solid red"; // Highlight the input field with a red border
    } else {
      error[input] = message; // Server side - Add the error message to the error object
    }
  }

  // Function to delete an error message for an input field
  const deleteErrorMessage = (input) => {
    delete error[input.id]; // Remove the error message from the error object
    input.style.border = "1px solid green"; // Highlight the input field with a green border
  };

  // Function to check if the input value length matches the required length
  const checkInputLength = (input, number) => {
    if (input.value.trim() !== "") {
      if (input.value.length === number) {
        deleteErrorMessage(input); // Delete error if the length matches
      } else {
        setErrorMessage(input, input.id + " must be " + number + " characters"); // Set error if the length does not match
      }
    }
  };

  // Function to check if the input value is not empty
  const checkInputValue = (input) => {
    if (input.value.trim() !== "") {
      deleteErrorMessage(input); // Delete error if the field is not empty
    } else {
      setErrorMessage(input, input.id + " is required"); // Set error if the field is empty
    }
  };

  // Function to validate the email format
  const checkEmail = (input) => {
    if (input.value.trim() !== "") {
      const re = /\S+@\S+\.\S+/; // Regular expression for email validation
      if (re.test(input.value.trim())) {
        deleteErrorMessage(input); // Delete error if the email format is valid
      } else {
        setErrorMessage(input, "Email is not valid"); // Set error if the email format is invalid
      }
    }
  };

  // Function to display all error messages
  const showErrorMessages = () => {
    const errorLabel = document.getElementById("error-label"); // Query the error label element
    errorLabel.innerHTML = ""; // Clear previous error messages
    for (const key in error) {
      const li = document.createElement("li"); // Create a list item for each error
      li.textContent = error[key]; // Set the error message as the list item's text
      li.style.color = "red"; // Set the text color to red
      errorLabel.appendChild(li); // Add the list item to the error label
    }
  }

  // Add event listeners for the buttons and overlay
  addBtn.addEventListener("click", addButtonPressed); // Open the modal when add button is pressed
  closeBtn.addEventListener("click", closeBtnPressed); // Close the modal when close button is pressed
  modalOverlay.addEventListener("click", closeWhenPressed); // Close the modal when clicking outside of it
  submitBtn.addEventListener("click", saveButtonPressed); // Handle form submission
  });
