package com.roadguardian.backend.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.roadguardian.backend.service.FileStorageService;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class FileStorageServiceImpl implements FileStorageService {

	@Value("${file.storage.path:uploads}")
	private String storageBasePath;

	@Value("${file.max-size:52428800}")
	private Long maxFileSize;

	public String uploadAccidentImage(MultipartFile file) throws IOException {
		return uploadFile(file, "accidents/images");
	}

	public String uploadAccidentVideo(MultipartFile file) throws IOException {
		return uploadFile(file, "accidents/videos");
	}

	public String uploadFile(MultipartFile file, String subfolder) throws IOException {
		// Validate file
		if (file == null || file.isEmpty()) {
			throw new IllegalArgumentException("File is empty");
		}

		if (file.getSize() > maxFileSize) {
			throw new IllegalArgumentException("File size exceeds maximum allowed size");
		}

		// Create directory if not exists
		Path folderPath = Paths.get(storageBasePath, subfolder);
		Files.createDirectories(folderPath);

		// Generate unique filename
		String originalFilename = file.getOriginalFilename();
		String extension = getFileExtension(originalFilename);
		String uniqueFilename = UUID.randomUUID() + "." + extension;

		// Save file
		Path filePath = folderPath.resolve(uniqueFilename);
		Files.write(filePath, file.getBytes());

		log.info("File uploaded: {}", filePath);

		return subfolder + "/" + uniqueFilename;
	}

	public byte[] downloadFile(String fileLocation) throws IOException {
		Path filePath = Paths.get(storageBasePath, fileLocation);

		if (!Files.exists(filePath)) {
			throw new IOException("File not found: " + fileLocation);
		}

		return Files.readAllBytes(filePath);
	}

	public void deleteFile(String fileLocation) throws IOException {
		Path filePath = Paths.get(storageBasePath, fileLocation);

		if (Files.exists(filePath)) {
			Files.delete(filePath);
			log.info("File deleted: {}", filePath);
		}
	}

	public boolean fileExists(String fileLocation) {
		Path filePath = Paths.get(storageBasePath, fileLocation);
		return Files.exists(filePath);
	}

	private String getFileExtension(String filename) {
		if (filename == null || !filename.contains(".")) {
			return "bin";
		}
		return filename.substring(filename.lastIndexOf(".") + 1).toLowerCase();
	}

	public void validateImageFile(MultipartFile file) throws IllegalArgumentException {
		String[] allowedExtensions = {"jpg", "jpeg", "png", "gif", "webp"};
		String extension = getFileExtension(file.getOriginalFilename());

		boolean isValid = false;
		for (String ext : allowedExtensions) {
			if (ext.equalsIgnoreCase(extension)) {
				isValid = true;
				break;
			}
		}

		if (!isValid) {
			throw new IllegalArgumentException("Invalid image file type. Allowed: jpg, jpeg, png, gif, webp");
		}

		if (file.getSize() > maxFileSize) {
			throw new IllegalArgumentException("File size exceeds maximum allowed size");
		}
	}

	public void validateVideoFile(MultipartFile file) throws IllegalArgumentException {
		String[] allowedExtensions = {"mp4", "avi", "mov", "mkv", "flv"};
		String extension = getFileExtension(file.getOriginalFilename());

		boolean isValid = false;
		for (String ext : allowedExtensions) {
			if (ext.equalsIgnoreCase(extension)) {
				isValid = true;
				break;
			}
		}

		if (!isValid) {
			throw new IllegalArgumentException("Invalid video file type. Allowed: mp4, avi, mov, mkv, flv");
		}

		if (file.getSize() > maxFileSize) {
			throw new IllegalArgumentException("File size exceeds maximum allowed size");
		}
	}
}
