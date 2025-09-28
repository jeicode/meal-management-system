export const scrollIntoView = (idElement: string) => {
    const element = document.getElementById(idElement);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}