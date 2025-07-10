// src/components/forms/ProofOfPaymentForm.jsx
"use client";

import { useState } from "react";
import React from "react";
import { useFormState } from "react-dom";
import { submitProofOfPayment } from "@/features/authentication/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, CheckCircle, Loader2, Upload } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function ProofOfPaymentForm({ transactionId }) {
  const [state, formAction] = React.useActionState(submitProofOfPayment, { status: null, message: "" });
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validasi tipe file
      const validTypes = ["image/jpeg", "image/jpg", "image/png"];
      if (!validTypes.includes(file.type)) {
        alert("Hanya file JPG, JPEG, atau PNG yang diperbolehkan");
        return;
      }

      // Validasi ukuran file (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("Ukuran file maksimal 5MB");
        return;
      }

      setSelectedFile(file);

      // Buat preview
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (formData) => {
    setIsUploading(true);
    try {
      await formAction(formData);
    } finally {
      setIsUploading(false);
    }
  };

  // Jika upload berhasil, tampilkan pesan sukses
  if (state?.status === "success") {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 text-green-700">
            <CheckCircle className="h-6 w-6" />
            <div>
              <h3 className="font-semibold">Bukti Pembayaran Berhasil Diunggah!</h3>
              <p className="text-sm text-green-600 mt-1">
                Status transaksi telah diperbarui menjadi "Menunggu Konfirmasi". Admin akan memverifikasi pembayaran Anda dalam 1x24 jam.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-slate-800 mb-2">Upload Bukti Pembayaran</h3>
            <p className="text-sm text-gray-600 mb-4">Silakan upload bukti pembayaran Anda. File yang diterima: JPG, JPEG, PNG (Max. 5MB)</p>
          </div>

          {/* Error Message */}
          {state?.status === "error" && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          )}

          <form action={handleSubmit} className="space-y-4">
            <input type="hidden" name="transactionId" value={transactionId} />

            {/* File Upload Area */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <input
                type="file"
                name="image"
                id="proof-image"
                accept="image/jpeg,image/jpg,image/png"
                onChange={handleFileChange}
                className="hidden"
                required
              />

              {preview ? (
                <div className="space-y-4">
                  <img src={preview} alt="Preview bukti pembayaran" className="max-w-xs max-h-48 mx-auto rounded-lg shadow-md object-contain" />
                  <p className="text-sm text-gray-600">
                    {selectedFile?.name} ({(selectedFile?.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                  <Button type="button" variant="outline" onClick={() => document.getElementById("proof-image").click()}>
                    Ganti File
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                  <div>
                    <Button type="button" variant="outline" onClick={() => document.getElementById("proof-image").click()}>
                      Pilih File
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500">Atau drag & drop file di sini</p>
                </div>
              )}
            </div>

            {/* Upload Instructions */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Petunjuk Upload:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Pastikan bukti pembayaran terlihat jelas</li>
                <li>• Sertakan nominal dan tanggal transaksi</li>
                <li>• Format file: JPG, JPEG, atau PNG</li>
                <li>• Ukuran maksimal: 5MB</li>
              </ul>
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={!selectedFile || isUploading}>
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Mengunggah...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Bukti Pembayaran
                </>
              )}
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
