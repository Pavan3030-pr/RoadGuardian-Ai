package com.roadguardian.backend.service;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public interface FileStorageService {

	String uploadAccidentImage(MultipartFile file) throws IOException;

	String uploadAccidentVideo(MultipartFile file) throws IOException;

	String uploadFile(MultipartFile file, String subfolder) throws IOException;

	byte[] downloadFile(String fileLocation) throws IOException;

	void deleteFile(String fileLocation) throws IOException;

	boolean fileExists(String fileLocation);

	void validateImageFile(MultipartFile file);

	void validateVideoFile(MultipartFile file);
}
