function showToaster(text, tailwindClass, toastElementHandler, showTime = 2000) {
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
    }, showTime);
}

export default showToaster;