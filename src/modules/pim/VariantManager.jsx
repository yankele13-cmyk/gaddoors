import React, { useState, useEffect } from 'react';
import { Plus, Trash2, RefreshCw, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

/**
 * PROPS:
 * - value: { hasVariants, variantOptions, variants }
 * - onChange: (newValue) => void
 * - basePrice: number
 * - baseStock: number
 */
export default function VariantManager({ value, onChange, basePrice = 0, baseStock = 0 }) {
    const [options, setOptions] = useState(value?.variantOptions || []);
    const [variants, setVariants] = useState(value?.variants || []);
    const [generated, setGenerated] = useState(false);

    // Sync internal state if props change externally (rare but good practice)
    useEffect(() => {
        if (value) {
            setOptions(value.variantOptions || []);
            setVariants(value.variants || []);
        }
    }, []);

    const updateParent = (newOptions, newVariants) => {
        onChange({
            hasVariants: true,
            variantOptions: newOptions,
            variants: newVariants
        });
    };

    // --- OPTION MANAGEMENT ---

    const addOption = () => {
        const newOptions = [...options, { name: '', values: [] }];
        setOptions(newOptions);
        // We don't update parent yet, wait for values
    };

    const removeOption = (index) => {
        const newOptions = options.filter((_, i) => i !== index);
        setOptions(newOptions);
        updateParent(newOptions, []); // Reset variants if structure changes
    };

    const updateOptionName = (index, name) => {
        const newOptions = [...options];
        newOptions[index].name = name;
        setOptions(newOptions);
    };

    const  addValueToOption = (index, valStr) => {
         if (!valStr.trim()) return;
         const newOptions = [...options];
         if (!newOptions[index].values.includes(valStr.trim())) {
             newOptions[index].values.push(valStr.trim());
             setOptions(newOptions);
         }
    };

    const removeValueFromOption = (optIndex, valIndex) => {
        const newOptions = [...options];
        newOptions[optIndex].values = newOptions[optIndex].values.filter((_, i) => i !== valIndex);
        setOptions(newOptions);
    };

    // --- GENERATION ---

    const generateVariants = () => {
        // Validation
        if (options.length === 0 || options.some(o => o.values.length === 0)) {
            alert("Il faut au moins une option avec des valeurs (ex: Taille > 80cm)");
            return;
        }

        // Cartesian Product
        // options = [{name: 'Taille', values:['70','80']}, {name: 'Sens', values:['G','D']}]
        // result = [{ attributes: {Taille:'70', Sens:'G'} }, ...]
        
        const cartesian = (args) => {
            const r = [];
            const max = args.length - 1;
            function helper(arr, i) {
                for (let j = 0, l = args[i].values.length; j < l; j++) {
                    const a = arr.slice(0); // clone arr
                    a.push({ name: args[i].name, value: args[i].values[j] });
                    if (i === max)
                        r.push(a);
                    else
                        helper(a, i + 1);
                }
            }
            helper([], 0);
            return r;
        };

        const combinations = cartesian(options);
        
        const newVariants = combinations.map(combo => {
            // combo is [{name:'Taille', value:'70'}, {name:'Sens', value:'G'}]
            
            // Generate SKU: BASE-70-G (we need a base but for now just concat values)
            const skuSuffix = combo.map(c => c.value).join('-');
            const attributes = {};
            combo.forEach(c => attributes[c.name] = c.value);

            return {
                id: uuidv4(),
                sku: skuSuffix.toUpperCase(), // placeholder, user can edit
                attributes: attributes,
                price: basePrice,
                stock: baseStock,
                visibility: true
            };
        });

        setVariants(newVariants);
        setGenerated(true);
        updateParent(options, newVariants);
    };

    // --- VARIANT EDITING ---

    const updateVariant = (index, field, val) => {
        const newVariants = [...variants];
        newVariants[index][field] = val;
        setVariants(newVariants);
        updateParent(options, newVariants); // Auto-save on change
    };

    const deleteVariant = (index) => {
         const newVariants = variants.filter((_, i) => i !== index);
         setVariants(newVariants);
         updateParent(options, newVariants);
    };

    return (
        <div className="space-y-6 bg-zinc-900/50 p-6 rounded-xl border border-zinc-800">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <RefreshCw size={20} className="text-[#d4af37]" /> 
                Générateur de Variantes
            </h3>

            {/* OPTIONS DEFINITION */}
            <div className="space-y-4">
                {options.map((option, idx) => (
                    <div key={idx} className="bg-zinc-950 p-4 rounded-lg border border-zinc-800">
                        <div className="flex gap-4 items-start">
                            <div className="w-1/3">
                                <label className="text-xs text-gray-500 mb-1 block">Nom de l'option</label>
                                <input 
                                    className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-white text-sm"
                                    placeholder="ex: Taille, Couleur..."
                                    value={option.name}
                                    onChange={(e) => updateOptionName(idx, e.target.value)}
                                />
                            </div>
                            <div className="flex-1">
                                <label className="text-xs text-gray-500 mb-1 block">Valeurs (Entrée pour ajouter)</label>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {option.values.map((val, vIdx) => (
                                        <span key={vIdx} className="bg-zinc-800 text-gray-300 text-xs px-2 py-1 rounded flex items-center gap-1">
                                            {val}
                                            <button onClick={() => removeValueFromOption(idx, vIdx)} className="hover:text-red-500"><X size={12}/></button>
                                        </span>
                                    ))}
                                </div>
                                <input 
                                    className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-white text-sm"
                                    placeholder="Ajouter une valeur et appuyez sur Entrée (ex: 70cm)"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            addValueToOption(idx, e.target.value);
                                            e.target.value = '';
                                        }
                                    }}
                                />
                            </div>
                            <button onClick={() => removeOption(idx)} className="text-red-500 p-2 hover:bg-red-500/10 rounded mt-5">
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}

                <button 
                    type="button"
                    onClick={addOption} 
                    className="text-sm text-[#d4af37] flex items-center gap-1 hover:underline"
                >
                    <Plus size={16} /> Ajouter une option
                </button>
            </div>

            {/* GENERATE ACTION */}
            {options.length > 0 && (
                <div className="flex justify-end p-4 border-t border-zinc-800 border-b mb-4">
                    <button 
                         type="button"
                         onClick={generateVariants}
                         className="bg-[#d4af37] text-black font-bold py-2 px-6 rounded hover:bg-yellow-500 transition shadow-lg shadow-yellow-500/20"
                    >
                        Générer {variants.length > 0 ? 'à nouveau' : 'les variantes'}
                    </button>
                </div>
            )}

            {/* VARIANTS TABLE */}
            {variants.length > 0 && (
                <div className="overflow-x-auto">
                     <table className="w-full text-left text-sm text-gray-400">
                        <thead className="bg-zinc-950 text-gray-200 uppercase tracking-wider">
                            <tr>
                                <th className="p-3">Variante</th>
                                <th className="p-3">SKU (Réf)</th>
                                <th className="p-3 w-24">Prix</th>
                                <th className="p-3 w-24">Stock</th>
                                <th className="p-3 w-10"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {variants.map((variant, idx) => (
                                <tr key={idx} className="hover:bg-zinc-800/30">
                                    <td className="p-3">
                                        <div className="flex gap-2">
                                            {Object.entries(variant.attributes).map(([k, v]) => (
                                                <span key={k} className="px-2 py-0.5 bg-zinc-800 rounded text-xs border border-zinc-700">
                                                   <span className="text-gray-500 mr-1">{k}:</span>{v}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="p-3">
                                        <input 
                                            value={variant.sku}
                                            onChange={(e) => updateVariant(idx, 'sku', e.target.value)}
                                            className="bg-transparent border-b border-zinc-700 focus:border-[#d4af37] outline-none w-full text-white font-mono text-xs"
                                        />
                                    </td>
                                    <td className="p-3">
                                         <input 
                                            type="number"
                                            value={variant.price}
                                            onChange={(e) => updateVariant(idx, 'price', parseFloat(e.target.value))}
                                            className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1 w-20 text-white focus:border-[#d4af37] outline-none text-right"
                                        />
                                    </td>
                                    <td className="p-3">
                                         <input 
                                            type="number"
                                            value={variant.stock}
                                            onChange={(e) => updateVariant(idx, 'stock', parseInt(e.target.value))}
                                            className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1 w-20 text-white focus:border-[#d4af37] outline-none text-right"
                                        />
                                    </td>
                                    <td className="p-3 text-right">
                                        <button onClick={() => deleteVariant(idx)} className="text-red-500 hover:text-white hover:bg-red-500 rounded p-1 transition">
                                            <Trash2 size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                     </table>
                </div>
            )}
        </div>
    );
}
