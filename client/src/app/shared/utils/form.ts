import { AbstractControl, FormGroup, ValidationErrors } from "@angular/forms"

export const regexNotOnlySpaces = /^(?!\s*$).+/
export const regexOnlyLetters = /^[^\d]+$/
export const regexEmail = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
export const regexCedulaColombia = /^((\d{8})|(\d{10})|(\d{11})|(\d{6}-\d{5}))?$/gm
export const regexCelularColombia = /^3[0-9]{9}$/
/**
   * Check if some field on form have errors in the validation
   * @param field: example: 'email'
   * @returns Promise<Boolean> : true || false
   */
export const hasErrorsFieldForm = (form: FormGroup, field: string, showErrors: boolean = false): boolean => {
    if (form.get(field)?.invalid && (form.get(field)?.dirty ||
        form.get(field)?.touched || showErrors)) {
        return true
    }
    return false
}