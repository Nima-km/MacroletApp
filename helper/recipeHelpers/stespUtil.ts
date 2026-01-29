import { DirectionStep } from "@/types/recipe";


export const addStep = (
    steps: DirectionStep[],
    step: DirectionStep
): DirectionStep[] => [...steps, step];

export const updateStep = (
    steps: DirectionStep[],
    stepId: string,
    updates: Partial<Omit<DirectionStep, 'id'>>
): DirectionStep[] =>
    steps.map(step =>
        step.id === stepId ? { ...step, ...updates } : step
    );

export const deleteStep = (
    steps: DirectionStep[],
    stepId: string
): DirectionStep[] =>
    steps.filter(step => step.id !== stepId);


export const addPhotoToStep = (
    steps: DirectionStep[],
    stepId: string,
    uri: string
): DirectionStep[] =>
    updateStep(steps, stepId, {
        photos: [
            ...(steps.find(s => s.id === stepId)?.photos ?? []),
        uri,
        ],
    });

export const removePhotoFromStep = (
    steps: DirectionStep[],
    stepId: string,
    uri: string
): DirectionStep[] =>
    updateStep(steps, stepId, {
        photos:
            steps.find(s => s.id === stepId)?.photos.filter(p => p !== uri) ??
        [],
    });