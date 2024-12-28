function showToaster(text, tailwindClass, toastElementHandler) {
    toastElementHandler({
        showToaster: true,
        toasterMessage: text,
        toasterTailwindTextColorClass: tailwindClass,
    });

    setTimeout(() => {
        toastElementHandler({
            showToaster: false,
            toasterMessage: "",
            toasterTailwindTextColorClass: "",
        });
    }, 2000);
}

export default showToaster;