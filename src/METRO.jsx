import { useState, useEffect } from "react";
import { FiEdit, FiTrash2, FiX } from "react-icons/fi"; 
import { doc, updateDoc, arrayUnion, getDoc, arrayRemove } from "firebase/firestore";
import { db } from "./firebase-config";

function METRO() {
  const [selectedRow, setSelectedRow] = useState(null);
  const [rows, setRows] = useState(Array.from({ length: 6 }, () => []));
  const [showAddModal, setShowAddModal] = useState(false);
  const [newBoxName, setNewBoxName] = useState("");
  const [rowToAdd, setRowToAdd] = useState(null);
  const [boxBeingEdited, setBoxBeingEdited] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [dragging, setDragging] = useState(null);

  // Add useEffect to fetch data on component mount
  useEffect(() => {
    fetchBoxes();
  }, []);

  // Disable body scroll when a modal is active
  useEffect(() => {
    document.body.style.overflow = selectedRow !== null ? "hidden" : "auto";
  }, [selectedRow]);

  // Add a new box to a row
  const addNewBox = async () => {
    if (rowToAdd !== null && newBoxName.trim()) {
      try {
        const docRef = doc(db, "METRO", "zggN1nUqZiq2LHe5uUNz");
  
        // Update Firestore: Add new box to the correct row
        await updateDoc(docRef, {
          [`box.${rowToAdd}`]: arrayUnion(newBoxName),
        });
  
        // Update local state for immediate UI update
        setRows((prevRows) =>
          prevRows.map((row, index) =>
            index === rowToAdd ? [...row, newBoxName] : row
          )
        );
  
        // Reset modal states
        setNewBoxName("");
        setShowAddModal(false);
        setRowToAdd(null);
      } catch (error) {
        console.error("Error adding box:", error);
      }
    }
  };

  // Edit box name
  const editBox = (rowIndex, colIndex) => {
    setBoxBeingEdited({ rowIndex, colIndex });
    setNewBoxName(rows[rowIndex][colIndex]);
  };

  // Save edited box
  const saveEditedBox = async () => {
    if (boxBeingEdited) {
      try {
        const { rowIndex, colIndex } = boxBeingEdited;
        const docRef = doc(db, "METRO", "zggN1nUqZiq2LHe5uUNz");
        
        // Get the current data first
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          const currentBoxes = data.box[rowIndex] || [];
          
          // Remove the old value and add the new one
          const oldValue = currentBoxes[colIndex];
          const newBoxes = [...currentBoxes];
          newBoxes[colIndex] = newBoxName;
          
          // Update Firestore
          await updateDoc(docRef, {
            [`box.${rowIndex}`]: newBoxes
          });
          
          // Update local state
          const updatedRows = [...rows];
          updatedRows[rowIndex][colIndex] = newBoxName;
          setRows(updatedRows);
          setNewBoxName("");
          setBoxBeingEdited(null);
        }
      } catch (error) {
        console.error("Error updating box:", error);
      }
    }
  };

  // Delete box with confirmation
  const deleteBox = (rowIndex, colIndex) => {
    setConfirmDelete({ rowIndex, colIndex });
  };

  // Confirm delete box
  const confirmBoxDeletion = async () => {
    if (confirmDelete) {
      try {
        const { rowIndex, colIndex } = confirmDelete;
        const docRef = doc(db, "METRO", "zggN1nUqZiq2LHe5uUNz");
        
        // Get the current data first
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          const currentBoxes = data.box[rowIndex] || [];
          
          // Remove the item at the specified index
          const newBoxes = [...currentBoxes];
          newBoxes.splice(colIndex, 1);
          
          // Update Firestore
          await updateDoc(docRef, {
            [`box.${rowIndex}`]: newBoxes
          });
          
          // Update local state
          const updatedRows = [...rows];
          updatedRows[rowIndex].splice(colIndex, 1);
          setRows(updatedRows);
          setConfirmDelete(null);
        }
      } catch (error) {
        console.error("Error deleting box:", error);
      }
    }
  };

  // Cancel delete box
  const cancelDelete = () => {
    setConfirmDelete(null);
  };

  // Handle drag start event
  const handleDragStart = (rowIndex, colIndex) => {
    setDragging({ rowIndex, colIndex });
  };

  // Handle drag over event
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Handle drop event
  const handleDrop = (e, targetRowIndex, targetColIndex) => {
    e.preventDefault();
    if (dragging) {
      const { rowIndex, colIndex } = dragging;
      const updatedRows = [...rows];
      // Remove the dragged item from the original row
      const draggedItem = updatedRows[rowIndex].splice(colIndex, 1)[0];
      // Add the dragged item to the new row
      updatedRows[targetRowIndex].splice(targetColIndex, 0, draggedItem);
      setRows(updatedRows);
      setDragging(null);
    }
  };

  const fetchBoxes = async () => {
    try {
      const docRef = doc(db, "METRO", "zggN1nUqZiq2LHe5uUNz");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log("Firestore data:", data);
        console.log("Box field:", data.box);
  
        // Extract the box values
        const boxValues = data.box ? Object.values(data.box) : [];
        
        // Create a new array with 6 rows
        const finalRows = Array.from({ length: 6 }, (_, index) => {
          // If we have data for this row in boxValues, use it; otherwise use empty array
          return boxValues[index] || [];
        });
  
        console.log("Final rows:", finalRows);
        setRows(finalRows);
      } else {
        console.warn("No such document!");
        // If no document exists, initialize with 6 empty rows
        setRows(Array.from({ length: 6 }, () => []));
      }
    } catch (error) {
      console.error("Error fetching document:", error);
      // If there's an error, initialize with 6 empty rows
      setRows(Array.from({ length: 6 }, () => []));
    }
  };

  return (
    <div className="min-h-screen overflow-y-auto">
      <h1 className="text-2xl font-bold mb-4">METRO</h1>
      <div className="space-y-4">
        {rows.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className={`p-2 rounded-lg bg-gray-100 flex items-center gap-2 transition-all`}
          >
            {/* View button to show row details */}
            <button
              className="p-2 bg-gray-700 text-white rounded-md"
              onClick={() => setSelectedRow(rowIndex)}
            >
              View
            </button>

            <div className="max-w-full overflow-x-auto hide-scrollbar flex-1">
              <div className="flex w-max gap-2">
                {row.map((box, colIndex) => (
                  <div
                    key={colIndex}
                    className="flex flex-col items-center p-2 rounded-md border border-black"
                    draggable
                    onDragStart={() => handleDragStart(rowIndex, colIndex)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, rowIndex, colIndex)}
                  >
                    <div className="w-24 h-24 md:w-20 md:h-20 bg-gray-400 rounded-md shadow-md flex flex-col items-center justify-center text-center relative overflow-hidden p-2">
                      <span className="absolute top-1 right-1 text-xs text-white bg-black px-1 rounded">
                        {rowIndex + 1}-{colIndex + 1}
                      </span>
                      <span className="text-white font-bold text-xs w-full flex items-center justify-center p-1 text-center leading-tight break-all">
                        {box}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* "Add" button to add new box to the row */}
            <button
              className="p-2 bg-green-500 text-white rounded-md"
              onClick={() => {
                setRowToAdd(rowIndex);
                setShowAddModal(true);
              }}
            >
              Add
            </button>
          </div>
        ))}
      </div>

      {/* View Modal for the selected row */}
      {selectedRow !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col gap-4 relative max-w-4xl">
            <button
              className="absolute top-2 right-2 text-gray-700"
              onClick={() => setSelectedRow(null)}
            >
              <FiX size={24} />
            </button>
            <h2 className="text-xl font-bold mb-4">Row {selectedRow + 1} Boxes</h2>
            <div className="overflow-x-auto hide-scrollbar">
              <div className="flex gap-2 w-max">
                {rows[selectedRow].map((box, colIndex) => (
                  <div
                    key={colIndex}
                    className="flex flex-col items-center p-2 rounded-md border border-black"
                    draggable
                    onDragStart={() => handleDragStart(selectedRow, colIndex)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, selectedRow, colIndex)}
                  >
                    <div className="w-24 h-24 md:w-20 md:h-20 bg-gray-400 rounded-md shadow-md flex flex-col items-center justify-center text-center relative overflow-hidden p-2">
                      <span className="absolute top-1 right-1 text-xs text-white bg-black px-1 rounded">
                        {selectedRow + 1}-{colIndex + 1}
                      </span>
                      <span className="text-white font-bold text-xs w-full flex items-center justify-center p-1 text-center leading-tight break-all">
                        {box}
                      </span>
                    </div>

                    {/* Edit and Delete buttons only show inside the view modal */}
                    <div className="flex gap-2 mt-2 p-2 w-full justify-center">
                      <button
                        className="p-2 bg-gray-700 text-white rounded-full border border-black"
                        onClick={() => editBox(selectedRow, colIndex)}
                      >
                        <FiEdit size={18} />
                      </button>
                      <button
                        className="p-2 bg-red-500 text-white rounded-full border border-black"
                        onClick={() => deleteBox(selectedRow, colIndex)}
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col gap-4 relative">
            <button
              className="absolute top-2 right-2 text-gray-700"
              onClick={cancelDelete}
            >
              <FiX size={24} />
            </button>
            <h2 className="text-xl font-bold">Are you sure you want to delete this box?</h2>
            <div className="flex justify-end gap-2">
              <button
                className="p-2 bg-gray-500 text-white rounded-md"
                onClick={cancelDelete}
              >
                Cancel
              </button>
              <button
                className="p-2 bg-red-500 text-white rounded-md"
                onClick={confirmBoxDeletion}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Box Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col gap-4 relative">
            <button
              className="absolute top-2 right-2 text-gray-700"
              onClick={() => setShowAddModal(false)}
            >
              <FiX size={24} />
            </button>
            <h2 className="text-xl font-bold">Add New Box</h2>
            <input
              type="text"
              className="border p-2 rounded w-full"
              placeholder="Enter box name"
              value={newBoxName}
              onChange={(e) => setNewBoxName(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button
                className="p-2 bg-gray-500 text-white rounded-md"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </button>
              <button
                className="p-2 bg-green-500 text-white rounded-md"
                onClick={addNewBox}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Box Modal */}
      {boxBeingEdited && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col gap-4 relative">
            <button
              className="absolute top-2 right-2 text-gray-700"
              onClick={() => setBoxBeingEdited(null)}
            >
              <FiX size={24} />
            </button>
            <h2 className="text-xl font-bold">Edit Box</h2>
            <input
              type="text"
              className="border p-2 rounded w-full"
              placeholder="Enter new box name"
              value={newBoxName}
              onChange={(e) => setNewBoxName(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button
                className="p-2 bg-gray-500 text-white rounded-md"
                onClick={() => setBoxBeingEdited(null)}
              >
                Cancel
              </button>
              <button
                className="p-2 bg-green-500 text-white rounded-md"
                onClick={saveEditedBox}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default METRO;