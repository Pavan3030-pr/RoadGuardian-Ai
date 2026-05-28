package com.roadguardian.backend.service;

import com.roadguardian.backend.model.entity.Notification;

import java.util.List;

public interface NotificationService {

	Notification createNotification(Long userId, String title, String message, Notification.NotificationType type);

	List<Notification> getUserNotifications(Long userId);

	List<Notification> getUnreadNotifications(Long userId);

	void markAsRead(Long notificationId);

	void deleteNotification(Long notificationId);

	void broadcastNewAccident(Long accidentId, String location);
}
