// Import the necessary Firestore functions from the Firebase SDK
import { getFirestore, collection, addDoc, onSnapshot, doc, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Declare variables outside the event listener
let modalOverlay;
let contactList;
let leftCol;
let rightCol;
let backBtn;
let firstName;
let lastName;
let phoneNumber;
let email;
let age;

// Initialize Firestore
const db = getFirestore(); // Get a reference to the Firestore service
const dbRef = collection(db, "contacts"); // Get a reference to the "contacts" collection

let contacts = []; // Array to store contacts

const debounce = (func, wait) => {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
};

// Function to get and log contacts from Firestore
const getContacts = async () => {
  try {
    onSnapshot(dbRef, (docsSnap) => {
      contacts = [];
      docsSnap.forEach((doc) => {
        const contact = doc.data();
        contact.id = doc.id;
        contacts.push(contact);
      });
      showContacts(contacts);
    });
  } catch (err) {
    console.log("getContacts: " + err);
  }
};

// Function to filter and highlight contacts based on search query
const filterContacts = (query) => {
  const lowerCaseQuery = query.toLowerCase();
  const filteredContacts = contacts.filter(contact => {
    return (
      (contact.firstName && contact.firstName.toLowerCase().includes(lowerCaseQuery)) ||
      (contact.lastName && contact.lastName.toLowerCase().includes(lowerCaseQuery)) ||
      (contact.email && contact.email.toLowerCase().includes(lowerCaseQuery)) ||
      (contact.phoneNumber && contact.phoneNumber.toLowerCase().includes(lowerCaseQuery))
    );
  });

  showContacts(filteredContacts);

  // Highlight matching text (example for name fields)
  document.querySelectorAll('.contact-list-item .title').forEach(item => {
    const regex = new RegExp(`(${query})`, 'gi');
    item.innerHTML = item.textContent.replace(regex, '<mark>$1</mark>');
  });
};

const handleSearchInput = debounce((event) => {
  const query = event.target.value;
  filterContacts(query);
}, 300);

const handleSearchButton = () => {
  const query = document.getElementById('site-db').value;
  filterContacts(query);
};

// Function to display contacts
const showContacts = (contacts) => {
  const fragment = document.createDocumentFragment();
  contacts.forEach(contact => {
    const li = document.createElement('li');
    li.className = 'contact-list-item';
    li.id = contact.id;

    // Check for undefined or null values
    const firstLetterFirstName = contact.firstName ? contact.firstName.charAt(0).toUpperCase() : '';
    const firstLetterLastName = contact.lastName ? contact.lastName.charAt(0).toUpperCase() : '';

    li.innerHTML = `
      <div class="media">
        <div class="two-letters">${firstLetterFirstName}${firstLetterLastName}</div>
      </div>
      <div class="content">
        <div class="title">${contact.firstName || ''} ${contact.lastName || ''}</div>
        <div class="subtitle">${contact.email || ''}</div>
      </div>
      <div class="action">
        <button class="edit-user">Edit</button>
        <button class="delete-user">DELETE</button>
      </div>`;
    fragment.appendChild(li);
  });

  // Ensure contactList is defined and present in the DOM
  if (contactList) {
    contactList.innerHTML = '';
    contactList.appendChild(fragment);
  } else {
    console.error('contactList is not defined');
  }
};

// Function to handle clicks on the contact list
const contactListPressed = (event) => {
  const id = event.target.closest("li").getAttribute("id");
  if (event.target.className === "edit-user") {
    editButtonPressed(id);
  } else if (event.target.className === "delete-user") {
    deleteButtonPressed(id);
  } else {
    displayContactOnDetailsView(id);
    toggleLeftAndRightCol();
  }
};

// Function to handle mobile view back button
const backBtnPressed = () => {
  if (document.body.clientWidth < 600) {
    leftCol.style.display = "block";
    rightCol.style.display = "none";
  }
};

// Function to toggle columns on mobile view
const toggleLeftAndRightCol = () => {
  if (document.body.clientWidth < 600) {
    leftCol.style.display = "none";
    rightCol.style.display = "block";
  }
};

// Function to delete a contact
const deleteButtonPressed = async (id) => {
  const isConfirmed = confirm("Are you sure you want to delete this contact?");
  if (isConfirmed) {
    try {
      const docRef = doc(db, "contacts", id);
      await deleteDoc(docRef);
    } catch (e) {
      setErrorMessage("error", "Error deleting document: " + e);
      showErrorMessages();
    }
  }
};

// Function to edit a contact
const editButtonPressed = (id) => {
  modalOverlay.style.display = "flex";
  const contact = getContact(id);

  firstName.value = contact.firstName;
  lastName.value = contact.lastName;
  phoneNumber.value = contact.phoneNumber;
  email.value = contact.email;
  age.value = contact.age;

  modalOverlay.setAttribute("contact-id", contact.id);
};

// Function to get a contact by ID
const getContact = (id) => {
  return contacts.find(contact => contact.id === id);
};

// Function to display contact details
const displayContactOnDetailsView = (id) => {
  const contact = getContact(id);
  const rightColDetail = document.getElementById("right-col-details");
  rightColDetail.innerHTML = `
    <div class="label">Name:</div>
    <div class="data">${contact.firstName} ${contact.lastName}</div>
    <div class="label">Age:</div>
    <div class="data">${contact.age}</div>
    <div class="label">Email:</div>
    <div class="data">${contact.email}</div>
    <div class="label">Phone Number:</div>
    <div class="data">${contact.phoneNumber}</div>
  `;
};

// Wait for the DOM content to load before running the script
document.addEventListener("DOMContentLoaded", () => {
  // Query DOM elements inside the event listener
  modalOverlay = document.getElementById("modal-overlay");
  contactList = document.getElementById("contact-list");
  leftCol = document.getElementById("left-column");
  rightCol = document.getElementById("right-column");
  backBtn = document.getElementById("backBtn");
  const addBtn = document.querySelector(".addBtn");
  const closeBtn = document.querySelector(".closeBtn");
  const submitBtn = document.querySelector(".submitBtn");

  firstName = document.getElementById("firstName");
  lastName = document.getElementById("lastName");
  phoneNumber = document.getElementById("phoneNumber");
  email = document.getElementById("email");
  age = document.getElementById("age");

  const error = {}; // Object to store error messages for form validation

  // Mapping object for user-friendly names
  const fieldNames = {
    firstName: "First name",
    lastName: "Last name",
    phoneNumber: "Phone number",
    email: "Email",
    age: "Age"
  };

  // Ensure inputs are enabled
  email.removeAttribute("disabled");
  email.removeAttribute("readonly");

  // Add event listeners for search functionality
  document.getElementById('site-db').addEventListener('input', handleSearchInput);
  document.querySelector('.searchBtn').addEventListener('click', handleSearchButton);

  // Function to check if required fields are filled
  const checkRequired = (inputArr) => {
    inputArr.forEach(input => {
      if (input.value.trim() === "") {
        setErrorMessage(input, fieldNames[input.id] + " is required");
      } else {
        deleteErrorMessage(input);
      }
    });
  };

  // Function to open the modal when the add button is pressed
  const addButtonPressed = () => {
    modalOverlay.style.display = "flex";
    modalOverlay.removeAttribute("contact-id");
    firstName.value = "";
    lastName.value = "";
    phoneNumber.value = "";
    email.value = "";
    age.value = "";
  };

  // Function to close the modal when the close button is pressed
  const closeBtnPressed = () => {
    modalOverlay.style.display = "none";
  };

  // Function to close the modal when clicking outside of it
  const closeWhenPressed = (e) => {
    if (e instanceof Event) {
      if (e.target === e.currentTarget) {
        modalOverlay.style.display = "none";
      }
    } else {
      modalOverlay.style.display = "none";
    }
  };

  // Function to handle form submission
  const saveButtonPressed = async () => {
    checkRequired([firstName, lastName, phoneNumber, email, age]);
    checkInputValue(firstName);
    checkInputValue(lastName);
    checkInputLength(phoneNumber, 9);
    checkEmail(email);
    checkInputLength(age, 2);
    showErrorMessages();

    if (Object.keys(error).length === 0) {
      if (modalOverlay.getAttribute("contact-id")) {
        const docRef = doc(db, "contacts", modalOverlay.getAttribute("contact-id"));
        try {
          await updateDoc(docRef, {
            firstName: firstName.value,
            lastName: lastName.value,
            phoneNumber: phoneNumber.value,
            email: email.value,
            age: age.value
          });
          closeWhenPressed();
        } catch (e) {
          setErrorMessage("error", "Error updating document: " + e);
          showErrorMessages();
        }
      } else {
        try {
          await addDoc(dbRef, {
            firstName: firstName.value,
            lastName: lastName.value,
            phoneNumber: phoneNumber.value,
            email: email.value,
            age: age.value
          });
          closeWhenPressed();
        } catch (err) {
          setErrorMessage("error", "Error adding document: " + err);
          showErrorMessages();
        }
      }
    }
  };

  // Function to set an error message for an input field
  const setErrorMessage = (input, message) => {
    if (input.nodeName === "INPUT") {
      error[input.id] = message;
      input.style.border = "1px solid red";
    } else {
      error[input] = message;
    }
  };

  // Function to delete an error message for an input field
  const deleteErrorMessage = (input) => {
    delete error[input.id];
    input.style.border = "1px solid green";
  };

  // Function to check if the input value length matches the required length
  const checkInputLength = (input, number) => {
    if (input.value.trim() !== "") {
      if (input.value.length === number) {
        deleteErrorMessage(input);
      } else {
        setErrorMessage(input, fieldNames[input.id] + " must be " + number + " characters");
      }
    }
  };

  // Function to check if the input value is not empty
  const checkInputValue = (input) => {
    if (input.value.trim() !== "") {
      deleteErrorMessage(input);
    } else {
      setErrorMessage(input, fieldNames[input.id] + " is required");
    }
  };

  // Function to validate the email format
  const checkEmail = (input) => {
    if (input.value.trim() !== "") {
      const re = /\S+@\S+\.\S+/;
      if (re.test(input.value.trim())) {
        deleteErrorMessage(input);
      } else {
        setErrorMessage(input, "Email is not valid");
      }
    }
  };

  // Function to display all error messages
  const showErrorMessages = () => {
    const errorLabel = document.getElementById("error-label");
    errorLabel.innerHTML = "";
    for (const key in error) {
      const li = document.createElement("li");
      li.textContent = error[key];
      li.style.color = "red";
      errorLabel.appendChild(li);
    }
  };

  // Add event listeners for the buttons and overlay
  addBtn.addEventListener("click", addButtonPressed);
  closeBtn.addEventListener("click", closeBtnPressed);
  modalOverlay.addEventListener("click", closeWhenPressed);
  submitBtn.addEventListener("click", saveButtonPressed);
  backBtn.addEventListener("click", backBtnPressed);
  contactList.addEventListener("click", debounce(contactListPressed, 300));

  getContacts();
});
