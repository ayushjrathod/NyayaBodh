"use client";

import {
  Button,
  Input,
  Modal,
  Select,
  SelectItem,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/react";
import { Edit2, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import EnhancedLoader from "../../components/ui/EnhancedLoader";
import { createUser, deleteUser, fetchAllUsers, updateUser } from "../../store/slices/adminSlice";

/**
 * Admin dashboard React component for listing and managing users.
 *
 * Renders a table of users fetched from the admin Redux slice and provides UI to
 * create, edit, and delete users via modals. On mount it dispatches fetchAllUsers.
 * Editing pre-fills a form; updates are dispatched with updateUser (password is
 * included only when provided). Creating dispatches createUser, closes the create
 * modal, and resets the form. Deletion asks for a browser confirmation before
 * dispatching deleteUser.
 *
 * @returns {JSX.Element} The admin dashboard UI.
 */
export default function AdminDashboard() {
  const dispatch = useDispatch();
  const { users, status } = useSelector((state) => state.admin);
  const [editUser, setEditUser] = useState(null);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    fullname: "",
    password: "",
    role: "USER",
  });

  useEffect(() => {
    dispatch(fetchAllUsers());
  }, [dispatch]);

  const handleEdit = (user) => {
    setEditUser(user);
    setFormData({
      email: user.email,
      fullname: user.fullname,
      role: user.role,
    });
  };

  const handleUpdate = async (userId, userData) => {
    try {
      await dispatch(
        updateUser({
          userId,
          userData: {
            email: userData.email,
            fullname: userData.fullname,
            role: userData.role,
            // Only include password if it's being updated
            ...(userData.password && { password: userData.password }),
          },
        })
      ).unwrap();
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  const handleCreate = async () => {
    await dispatch(createUser(formData));
    setCreateModalOpen(false);
    setFormData({ email: "", fullname: "", password: "", role: "USER" });
  };

  const handleDelete = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      await dispatch(deleteUser(userId));
    }
  };

  return (
    <div>
      <Button color="primary" onPress={() => setCreateModalOpen(true)}>
        Add New User
      </Button>

      {status === "loading" ? (
        <div className="flex justify-center items-center py-8">
          <EnhancedLoader size="md" label="Loading users..." center={true} />
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableColumn>Email</TableColumn>
            <TableColumn>Full Name</TableColumn>
            <TableColumn>Role</TableColumn>
            <TableColumn>Actions</TableColumn>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.fullname}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  <Button onClick={() => handleEdit(user)}>
                    <Edit2 />
                  </Button>
                  <Button onClick={() => handleDelete(user.id)}>
                    <Trash2 />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Edit Modal */}
      {editUser && (
        <Modal isOpen onClose={() => setEditUser(null)}>
          <Input
            label="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <Input
            label="Full Name"
            value={formData.fullname}
            onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
          />
          <Select
            label="Role"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          >
            <SelectItem key="ADMIN" value="ADMIN">
              Admin
            </SelectItem>
            <SelectItem key="LAWYER" value="LAWYER">
              Lawyer
            </SelectItem>
            <SelectItem key="JUDGE" value="JUDGE">
              Judge
            </SelectItem>
            <SelectItem key="CLERK" value="CLERK">
              Clerk
            </SelectItem>
            <SelectItem key="USER" value="USER">
              User
            </SelectItem>
          </Select>
          <Button onClick={() => handleUpdate(editUser.id, formData)}>Update</Button>
        </Modal>
      )}

      {/* Create Modal */}
      {isCreateModalOpen && (
        <Modal isOpen onClose={() => setCreateModalOpen(false)}>
          <Input
            label="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <Input
            label="Full Name"
            value={formData.fullname}
            onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
          />
          <Input
            type="password"
            label="Password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
          <Select
            label="Role"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          >
            <SelectItem key="ADMIN" value="ADMIN">
              Admin
            </SelectItem>
            <SelectItem key="LAWYER" value="LAWYER">
              Lawyer
            </SelectItem>
            <SelectItem key="JUDGE" value="JUDGE">
              Judge
            </SelectItem>
            <SelectItem key="CLERK" value="CLERK">
              Clerk
            </SelectItem>
            <SelectItem key="USER" value="USER">
              User
            </SelectItem>
          </Select>
          <Button onClick={handleCreate}>Create</Button>
        </Modal>
      )}
    </div>
  );
}
