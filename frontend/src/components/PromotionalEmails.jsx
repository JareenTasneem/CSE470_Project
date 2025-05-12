import React, { useState, useEffect } from 'react';
import axios from '../axiosConfig';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

const PromotionalEmails = () => {
  const [emails, setEmails] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [formData, setFormData] = useState({
    subject: '',
    content: '',
    scheduledFor: '',
    recipientType: 'all',
    recipients: [],
    membershipTier: 'Bronze',
  });
  const [users, setUsers] = useState([]);
  const { user } = useAuth();

  // Tiptap editor instance
  const editor = useEditor({
    extensions: [StarterKit],
    content: formData.content,
    onUpdate: ({ editor }) => {
      setFormData((prev) => ({
        ...prev,
        content: editor.getHTML(),
      }));
    },
  });

  useEffect(() => {
    fetchEmails();
    fetchUsers();
  }, []);

  const fetchEmails = async () => {
    try {
      const response = await axios.get('/promotional-emails');
      setEmails(response.data);
    } catch (error) {
      console.error('Error fetching emails:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedEmail) {
        await axios.put('/promotional-emails', formData);
      } else {
        await axios.post('/promotional-emails', formData);
      }
      setShowForm(false);
      setSelectedEmail(null);
      setFormData({
        subject: '',
        content: '',
        scheduledFor: '',
        recipientType: 'all',
        recipients: [],
        membershipTier: 'Bronze',
      });
      if (editor) editor.commands.setContent('');
      fetchEmails();
    } catch (error) {
      console.error('Error saving email:', error);
    }
  };

  const handleEdit = (email) => {
    setSelectedEmail(email);
    setFormData({
      subject: email.subject,
      content: email.content,
      scheduledFor: format(new Date(email.scheduledFor), "yyyy-MM-dd'T'HH:mm"),
      recipientType: email.recipientType,
      recipients: email.recipients.map(r => r._id),
      membershipTier: email.membershipTier || 'Bronze',
    });
    if (editor) editor.commands.setContent(email.content || '');
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this email?')) {
      try {
        await axios.delete('/promotional-emails', { data: { id } });
        fetchEmails();
      } catch (error) {
        console.error('Error deleting email:', error);
      }
    }
  };

  const handleSendNow = async (id) => {
    try {
      await axios.post(`/promotional-emails/${id}/send`);
      fetchEmails();
    } catch (error) {
      console.error('Error sending email:', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Promotional Emails</h2>
        <button
          onClick={() => {
            setShowForm(true);
            setSelectedEmail(null);
            setFormData({
              subject: '',
              content: '',
              scheduledFor: '',
              recipientType: 'all',
              recipients: [],
              membershipTier: 'Bronze',
            });
            if (editor) editor.commands.setContent('');
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Create New Email
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto border border-gray-200">
            <h3 className="text-2xl font-bold mb-6 text-center">
              {selectedEmail ? 'Edit Email' : 'Create New Email'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block mb-1 font-semibold">Subject</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold">Content</label>
                <div className="border border-gray-300 rounded p-2 min-h-[150px] bg-white">
                  <EditorContent editor={editor} />
                </div>
              </div>

              <div>
                <label className="block mb-1 font-semibold">Schedule For</label>
                <input
                  type="datetime-local"
                  name="scheduledFor"
                  value={formData.scheduledFor}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold">Recipient Type</label>
                <select
                  name="recipientType"
                  value={formData.recipientType}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="all">All Users</option>
                  <option value="selected">Selected Users</option>
                  <option value="membership_tier">By Membership Tier</option>
                </select>
              </div>

              {formData.recipientType === 'selected' && (
                <div>
                  <label className="block mb-1 font-semibold">Select Recipients</label>
                  <div className="border rounded p-2 bg-gray-50 max-h-48 overflow-y-auto">
                    <select
                      multiple
                      name="recipients"
                      value={formData.recipients}
                      onChange={(e) => {
                        const values = Array.from(e.target.selectedOptions, option => option.value);
                        setFormData(prev => ({ ...prev, recipients: values }));
                      }}
                      className="w-full h-32 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                    >
                      {users.length === 0 ? (
                        <option disabled>No users found</option>
                      ) : (
                        users.map(user => (
                          <option key={user._id} value={user._id}>
                            {user.name} ({user.email})
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Hold Ctrl (Windows) or Cmd (Mac) to select multiple users.</p>
                </div>
              )}

              {formData.recipientType === 'membership_tier' && (
                <div>
                  <label className="block mb-1 font-semibold">Membership Tier</label>
                  <select
                    name="membershipTier"
                    value={formData.membershipTier}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="Bronze">Bronze</option>
                    <option value="Silver">Silver</option>
                    <option value="Gold">Gold</option>
                    <option value="Platinum">Platinum</option>
                  </select>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-gray-500 text-white px-5 py-2 rounded hover:bg-gray-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-5 py-2 rounded hover:bg-blue-600 font-semibold"
                >
                  {selectedEmail ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {emails.map((email) => (
          <div key={email._id} className="border p-4 rounded">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">{email.subject}</h3>
                <p className="text-gray-600">
                  Scheduled for: {format(new Date(email.scheduledFor), 'PPpp')}
                </p>
                <p className="text-gray-600">Status: {email.status}</p>
                <p className="text-gray-600">
                  Recipients: {email.recipientType === 'all' ? 'All Users' :
                    email.recipientType === 'membership_tier' ? `${email.membershipTier} Members` :
                    `${email.recipients.length} Selected Users`}
                </p>
              </div>
              <div className="flex gap-2">
                {email.status !== 'sent' && (
                  <>
                    <button
                      onClick={() => handleEdit(email)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(email._id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => handleSendNow(email._id)}
                      className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                    >
                      Send Now
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PromotionalEmails; 