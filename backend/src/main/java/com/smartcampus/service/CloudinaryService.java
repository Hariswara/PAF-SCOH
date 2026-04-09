package com.smartcampus.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public class CloudinaryService {
    private final Cloudinary cloudinary;

    public CloudinaryService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    /**
     * Uploads a file to Cloudinary under the "ticket-attachments" folder.
     *
     * @return Map with keys: "public_id", "secure_url"
     */
    @SuppressWarnings("unchecked")
    public Map<String, String> upload(MultipartFile file) throws IOException {
        Map<?, ?> result = cloudinary.uploader().upload(
                file.getBytes(),
                ObjectUtils.asMap(
                        "folder", "smart-campus/ticket-attachments",
                        "resource_type", "auto",
                        "use_filename", true,
                        "unique_filename", true));
        return Map.of(
                "public_id", (String) result.get("public_id"),
                "secure_url", (String) result.get("secure_url"));
    }

    /** Deletes a file from Cloudinary by its public_id. */
    public void delete(String publicId) throws IOException {
        cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
    }
}
