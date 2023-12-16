import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { api } from "~/utils/api";

export default function Dashboard() {
  const user = useUser();
  const [isModalOpen, setModalOpen] = useState(false);
  const [newItem, setNewItem] = useState({
    name: "",
    status: "",
    feedback: "",
    rating: 0,
  });
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [editedFields, setEditedFields] = useState({
    name: "",
    status: "",
    feedback: "",
    rating: 0,
  });

  // Mutations
  const { mutate } = api.post.create.useMutation();
  const { mutate: updateInterviewee } = api.post.updateInterviewee.useMutation();

  // Queries
  const intervieweesQuery = api.post.getInterviewee.useQuery({
    authorid: user?.user?.id ?? "", // Adjust the default value as needed
  });

  // Event handlers
  const handleAddItemClick = () => {
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
  };

  const handleInputChange = (e: { target: { name: string; value: string | number } }) => {
    const { name, value } = e.target;
    setNewItem((prevItem) => ({
      ...prevItem,
      [name]: name === "rating" ? +value : value,
    }));
  };

  const handleAddItem = () => {
    if (user?.user) {
      mutate({ ...newItem, authorid: user.user.id }, {
        onSuccess: () => {
          void intervieweesQuery.refetch();
          setModalOpen(false);
          location.reload();
        },
      });
    }
  };

  const handleEditClick = (index: number) => {
    setIsEditing(index);

    const currentItem = intervieweesQuery.data?.[index];
    setEditedFields({
      name: currentItem?.name ?? "",
      status: currentItem?.status ?? "",
      feedback: currentItem?.feedback ?? "",
      rating: currentItem?.rating ?? 0,
    });
  };

  const handleSaveClick = async (index: number) => {
    if (user?.user) {
      try {
        updateInterviewee({
          id: intervieweesQuery?.data?.[index]?.id ?? "",
          ...editedFields,
          authorId: user.user.id,
        });

        void intervieweesQuery.refetch();
        location.reload();
        setIsEditing(null);
      } catch (error) {
        console.error("Error updating interviewee:", error);
        // Handle error state as needed
      }
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(null);
  };

  useEffect(() => {
    void intervieweesQuery.refetch();
  }, [intervieweesQuery.refetch]);


  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Interviewee Dashboard</h1>
      {user.user != null && (
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={handleAddItemClick}
        >
          Add Item
        </button>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-collapse border-gray-300">
          <thead className="bg-blue-200">
            <tr>
              <th className="py-2 px-4 border">Name</th>
              <th className="py-2 px-4 border">Status</th>
              <th className="py-2 px-4 border">Feedback</th>
              <th className="py-2 px-4 border">Rating</th>
              <th className="py-2 px-4 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {intervieweesQuery.data?.map((e, index) => (
              <tr key={index} className={index % 2 === 0 ? "bg-gray-100" : "bg-white"}>
                <td className="py-2 px-4 border text-center">
                  {isEditing === index ? (
                    <input
                      type="text"
                      name="name"
                      value={editedFields.name}
                      onChange={(e) => setEditedFields({ ...editedFields, name: e.target.value })}
                    />
                  ) : (
                    e.name
                  )}
                </td>
                <td className="py-2 px-4 border text-center">
                  {isEditing === index ? (
                    <input
                      type="text"
                      name="status"
                      value={editedFields.status}
                      onChange={(e) => setEditedFields({ ...editedFields, status: e.target.value })}
                    />
                  ) : (
                    e.status
                  )}
                </td>
                <td className="py-2 px-4 border text-center">
                  {isEditing === index ? (
                    <input
                      type="text"
                      name="feedback"
                      value={editedFields.feedback}
                      onChange={(e) => setEditedFields({ ...editedFields, feedback: e.target.value })}
                    />
                  ) : (
                    e.feedback == "" ? "No feedback" : e.feedback
                  )}
                </td>
                <td className="py-2 px-4 border text-center">
                  {isEditing === index ? (
                    <input
                      type="number"
                      name="rating"
                      value={editedFields.rating}
                      onChange={(e) => setEditedFields({ ...editedFields, rating: +e.target.value })}
                    />
                  ) : (
                    e.rating
                  )}
                </td>
                <td className="py-2 px-4 border text-center">
                  {isEditing === index ? (
                    <>
                      <button
                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2"
                        onClick={() => handleSaveClick(index)}
                      >
                        Save
                      </button>
                      <button
                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                        onClick={handleCancelEdit}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      className="bg-blue-500 hover.bg-blue-700 text-white font.bold py-2 px-4 rounded"
                      onClick={() => handleEditClick(index)}
                    >
                      Edit
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-bold mb-4">Add New Item</h2>
            <form>
              <label className="block mb-2">Name:</label>
              <input
                type="text"
                name="name"
                value={newItem.name}
                onChange={handleInputChange}
                className="border p-2 mb-4 w-full"
              />

              <label className="block mb-2">Status:</label>
              <input
                type="text"
                name="status"
                value={newItem.status}
                onChange={handleInputChange}
                className="border p-2 mb-4 w-full"
              />

              <label className="block mb-2">Feedback:</label>
              <input
                type="text"
                name="feedback"
                value={newItem.feedback}
                onChange={handleInputChange}
                className="border p-2 mb-4 w-full"
              />

              <label className="block mb-2">Rating:</label>
              <input
                type="number"
                name="rating"
                value={newItem.rating}
                onChange={handleInputChange}
                className="border p-2 mb-4 w-full"
              />

              <button
                type="button"
                onClick={handleAddItem}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Add Item
              </button>
            </form>
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={handleModalClose}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
