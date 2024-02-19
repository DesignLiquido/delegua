class DelegatedClassObject {
    delegatedClass: DelegatedClass;
    properties: { [name: string]: any };

    constructor(delegatedClass: DelegatedClass) {
        this.delegatedClass = delegatedClass;
        this.properties = {};

        if (this.delegatedClass.superClass) {
            for (let property of this.delegatedClass.superClass.properties) {
                this.properties[property.name.lexeme] = undefined;
            }
        }

        for (let property of delegatedClass.properties) {
            this.properties[property.name.lexeme] = undefined;
        }
    }

    getValue(symbol: SymbolInterface): any {
        if (this.properties.hasOwnProperty(symbol.lexeme)) {
            return this.properties[symbol.lexeme];
        }

        const method = this.delegatedClass.findMethod(symbol.lexeme);
        if (method) return method.executeMethodOfClass(this);

        throw new RuntimeExecutionError(symbol, `Method or property "${symbol.lexeme}" does not exist in this object.`);
    }

    setValue(symbol: SymbolInterface, value: any): void {
        if (this.delegatedClass.requiresPropertyDeclaration && !this.properties.hasOwnProperty(symbol.lexeme)) {
            throw new RuntimeExecutionError(
                symbol,
                `Property "${symbol.lexeme}" was not defined in the declaration of the class ${this.delegatedClass.originalSymbol.lexeme}.`
            );
        }

        this.properties[symbol.lexeme] = value;
    }

    /**
     * Method used by Delegua to inspect this object during debugging.
     * @returns {string} The object representation as text.
     */
    toText(): string {
        return `<Object ${this.delegatedClass.originalSymbol.lexeme}>`;
    }

    /**
     * Method used by VSCode to represent this object when printed.
     * @returns {string} The object representation as text.
     */
    toString(): string {
        return this.toText();
    }
}
