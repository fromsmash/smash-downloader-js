export interface CustomEvent {
    name: string;
    data?: any;
}
export declare class CustomEventEmitter {
    private listeners;
    on<T>(event: string, callback: ((event: T & CustomEvent) => void)): CustomEventEmitter;
    off(event?: string): CustomEventEmitter;
    emit(event: string, data: CustomEvent): CustomEventEmitter;
    dispatch(event: CustomEvent): CustomEventEmitter;
}
