export class RoomHelper {
    static handleStudentsOperation(
        current: string[] = [],
        operation: 'add' | 'remove' | 'replace',
        values: string[]
    ): string[] {
        switch (operation) {
            case 'add':
                return Array.from(new Set([...current, ...values]));
            case 'remove':
                return current.filter(id => !values.includes(id));
            case 'replace':
                return values;
            default:
                throw new Error("Invalid operation. Use 'add', 'remove' or 'replace'");
        }
    }
}