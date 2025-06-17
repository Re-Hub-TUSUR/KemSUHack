import { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Event, EventFormData } from '../types';
import { toast } from 'react-toastify';

export const useEventActions = (refetchEvents: () => void) => {
    const { fetchWithAuth } = useAuth();

    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    
    const [eventToEdit, setEventToEdit] = useState<Event | null>(null);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    
    const [eventToDeleteId, setEventToDeleteId] = useState<number | null>(null);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleViewDetails = useCallback((event: Event | null) => {
        setSelectedEvent(event);
        setIsDetailModalOpen(!!event);
    }, []);

    const handleCloseDetailModal = () => {
        setIsDetailModalOpen(false);
        setSelectedEvent(null);
    };

    const handleOpenAddForm = () => {
        setEventToEdit(null);
        setIsFormModalOpen(true);
    };

    const handleOpenEditForm = (event: Event) => {
        setEventToEdit(event);
        setIsFormModalOpen(true);
    };
    
    const handleCloseFormModal = () => {
        setIsFormModalOpen(false);
        setEventToEdit(null);
    };

    const handleDeleteEvent = (eventId: number) => {
        setEventToDeleteId(eventId);
        setIsConfirmModalOpen(true);
    };

    const handleCloseConfirmModal = () => {
        setIsConfirmModalOpen(false);
        setEventToDeleteId(null);
    };

    const confirmDeleteAction = async () => {
        if (eventToDeleteId === null) return;
        setIsDeleting(true);
        try {
            await fetchWithAuth(`/api/events/${eventToDeleteId}`, { method: 'DELETE' });
            toast.success("Мероприятие успешно удалено!");
            refetchEvents();
            if (selectedEvent?.id === eventToDeleteId) handleCloseDetailModal();
        } catch (err) {
            if (!(err instanceof Error && err.message.includes('401'))) {
                toast.error(err instanceof Error ? err.message : 'Ошибка удаления');
            }
        } finally {
            setIsDeleting(false);
            handleCloseConfirmModal();
        }
    };

    const handleSaveEvent = async (formData: EventFormData, imageFile: File | null) => {
        const isEditing = !!eventToEdit;
        try {
            let savedEvent: Event;
            if (isEditing) {
                const response = await fetchWithAuth(`/api/events/${eventToEdit!.id}`, { method: 'PUT', body: JSON.stringify(formData) });
                savedEvent = await response.json();
                toast.success("Данные мероприятия успешно обновлены!");
            } else {
                const response = await fetchWithAuth('/api/events', { method: 'POST', body: JSON.stringify(formData) });
                savedEvent = await response.json();
                toast.success("Мероприятие успешно создано!");
            }

            if (imageFile && savedEvent.id) {
                const imageFormData = new FormData();
                imageFormData.append('image', imageFile);
                const imageResponse = await fetchWithAuth(`/api/events/${savedEvent.id}/upload_image`, { method: 'POST', body: imageFormData });
                if (!imageResponse.ok) {
                    toast.warn(`Мероприятие сохранено, но не удалось загрузить изображение: ${(await imageResponse.json()).error}`);
                }
            }
            refetchEvents();
            handleCloseFormModal();
        } catch (err) {
            if (!(err instanceof Error && err.message.includes('401'))) {
                toast.error(err instanceof Error ? err.message : 'Ошибка сохранения');
                throw err;
            }
        }
    };

    const handleImageDelete = async (eventId: number) => {
        try {
            await fetchWithAuth(`/api/events/${eventId}/image`, { method: 'DELETE' });
            refetchEvents();
            toast.success("Изображение успешно удалено!");
        } catch (err) {
            if (!(err instanceof Error && err.message.includes('401'))) {
                toast.error(err instanceof Error ? err.message : 'Ошибка удаления изображения');
                throw err;
            }
        }
    };

    return {
        selectedEvent,
        isDetailModalOpen,
        eventToEdit,
        isFormModalOpen,
        isConfirmModalOpen,
        isDeleting,
        handleViewDetails,
        handleCloseDetailModal,
        handleOpenAddForm,
        handleOpenEditForm,
        handleCloseFormModal,
        handleDeleteEvent,
        handleCloseConfirmModal,
        confirmDeleteAction,
        handleSaveEvent,
        handleImageDelete,
    };
};