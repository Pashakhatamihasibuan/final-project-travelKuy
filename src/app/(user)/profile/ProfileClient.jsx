"use client";

import { useEffect, useState, useRef } from "react";
import { updateProfileAction, uploadProfileImageAction } from "@/lib/actions"; // Import from the new actions file
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import PageHeader from "@/components/ui/PageHeader";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

function getInitials(name) {
  if (!name) return "U";
  const names = name.split(" ");
  const initials = names.map((n) => n[0]).join("");
  return initials.toUpperCase();
}

export default function ProfileClient({ user: initialUser }) {
  const [user, setUser] = useState(initialUser);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phoneNumber: "", profilePictureUrl: "" });
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (initialUser) {
      setForm({
        name: initialUser?.name || "",
        email: initialUser?.email || "",
        phoneNumber: initialUser?.phoneNumber || "",
        profilePictureUrl: initialUser?.profilePictureUrl || "",
      });
    }
  }, [initialUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const uploadToast = toast.loading("Uploading image...");
    const formData = new FormData();
    formData.append("image", file);

    const result = await uploadProfileImageAction(formData);

    if (result.success) {
      toast.success("Image uploaded successfully!", { id: uploadToast });
      // Update the form state with the new image URL for preview
      setForm((prev) => ({ ...prev, profilePictureUrl: result.url }));
    } else {
      toast.error(result.message, { id: uploadToast });
    }
  };

  const handleEdit = () => setEditMode(true);
  const handleCancel = () => {
    setEditMode(false);
    // Reset form to original user data on cancel
    setForm({
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      profilePictureUrl: user.profilePictureUrl,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await updateProfileAction(form);

    if (result.success) {
      toast.success(result.message);
      setEditMode(false);
      // Update the main user state so the new profile is displayed
      setUser((prev) => ({ ...prev, ...form }));
    } else {
      toast.error(result.message);
    }

    setLoading(false);
  };

  if (!user) {
    return <div className="container mx-auto py-8 text-center">Loading...</div>;
  }

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <PageHeader title="My Profile" />
      <Card className="shadow-lg">
        <CardHeader className="flex flex-col items-center text-center">
          <Avatar className="h-24 w-24 shadow-md">
            <AvatarImage src={editMode ? form.profilePictureUrl : user.profilePictureUrl} alt={user.name} />
            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
          </Avatar>
          <CardTitle className="mt-4 text-2xl font-bold">{editMode ? form.name : user.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {!editMode ? (
            <>
              <div className="flex justify-between border-b py-3">
                <span className="font-semibold text-gray-600">Email:</span>
                <span className="text-gray-800">{user.email}</span>
              </div>
              <div className="flex justify-between border-b py-3">
                <span className="font-semibold text-gray-600">Phone Number:</span>
                <span className="text-gray-800">{user.phoneNumber}</span>
              </div>
              <div className="flex justify-between border-b py-3">
                <span className="font-semibold text-gray-600">Role:</span>
                <span className="capitalize text-gray-800">{user.role}</span>
              </div>
              <div className="flex justify-end pt-4">
                <Button onClick={handleEdit}>Edit Profile</Button>
              </div>
            </>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="font-medium">Profile Picture</Label>
                <div className="flex items-center gap-4 mt-2">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={form.profilePictureUrl} />
                    <AvatarFallback>{getInitials(form.name)}</AvatarFallback>
                  </Avatar>
                  <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/png, image/jpeg" />
                  <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                    Upload Image
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="name" className="font-medium">
                  Name
                </Label>
                <Input type="text" id="name" name="name" value={form.name} onChange={handleChange} required />
              </div>
              <div>
                <Label htmlFor="email" className="font-medium">
                  Email
                </Label>
                <Input type="email" id="email" name="email" value={form.email} onChange={handleChange} required />
              </div>
              <div>
                <Label htmlFor="phoneNumber" className="font-medium">
                  Phone Number
                </Label>
                <Input type="tel" id="phoneNumber" name="phoneNumber" value={form.phoneNumber} onChange={handleChange} />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={loading}>
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
                <Button type="button" variant="ghost" onClick={handleCancel} disabled={loading}>
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
