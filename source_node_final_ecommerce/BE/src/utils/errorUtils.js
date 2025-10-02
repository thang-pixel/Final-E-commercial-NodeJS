
const schemaError = (errors) => {
    let errRs = { email: '', password: '', phone: ''};

    if (errors.email){
        errRs.email = errors.email.properties.message;
    }

    return errRs
}

export {
    schemaError
}