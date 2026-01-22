-- Create estimate status enum
CREATE TYPE public.estimate_status AS ENUM ('draft', 'sent', 'accepted', 'rejected', 'expired');

-- Create purchase order status enum
CREATE TYPE public.purchase_order_status AS ENUM ('draft', 'sent', 'confirmed', 'delivered', 'cancelled');

-- Create estimates table
CREATE TABLE IF NOT EXISTS public.estimates (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    client_id UUID REFERENCES public.clients(id),
    estimate_number TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    amount NUMERIC NOT NULL,
    tax_amount NUMERIC DEFAULT 0,
    total_amount NUMERIC NOT NULL,
    status estimate_status NOT NULL DEFAULT 'draft',
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    valid_until DATE NOT NULL,
    accepted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create estimate items table
CREATE TABLE IF NOT EXISTS public.estimate_items (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    estimate_id UUID NOT NULL REFERENCES public.estimates(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price NUMERIC NOT NULL,
    amount NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create purchase orders table
CREATE TABLE IF NOT EXISTS public.purchase_orders (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    client_id UUID REFERENCES public.clients(id),
    order_number TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    amount NUMERIC NOT NULL,
    tax_amount NUMERIC DEFAULT 0,
    total_amount NUMERIC NOT NULL,
    status purchase_order_status NOT NULL DEFAULT 'draft',
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    delivery_date DATE,
    confirmed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create purchase order items table
CREATE TABLE IF NOT EXISTS public.purchase_order_items (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    purchase_order_id UUID NOT NULL REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price NUMERIC NOT NULL,
    amount NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.estimates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estimate_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;

-- Estimates policies
CREATE POLICY "Users can view their own estimates" ON public.estimates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own estimates" ON public.estimates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own estimates" ON public.estimates FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own estimates" ON public.estimates FOR DELETE USING (auth.uid() = user_id);

-- Estimate items policies
CREATE POLICY "Users can view their own estimate items" ON public.estimate_items FOR SELECT 
USING (EXISTS (SELECT 1 FROM estimates WHERE estimates.id = estimate_items.estimate_id AND estimates.user_id = auth.uid()));
CREATE POLICY "Users can insert their own estimate items" ON public.estimate_items FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM estimates WHERE estimates.id = estimate_items.estimate_id AND estimates.user_id = auth.uid()));
CREATE POLICY "Users can update their own estimate items" ON public.estimate_items FOR UPDATE 
USING (EXISTS (SELECT 1 FROM estimates WHERE estimates.id = estimate_items.estimate_id AND estimates.user_id = auth.uid()));
CREATE POLICY "Users can delete their own estimate items" ON public.estimate_items FOR DELETE 
USING (EXISTS (SELECT 1 FROM estimates WHERE estimates.id = estimate_items.estimate_id AND estimates.user_id = auth.uid()));

-- Purchase orders policies
CREATE POLICY "Users can view their own purchase orders" ON public.purchase_orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own purchase orders" ON public.purchase_orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own purchase orders" ON public.purchase_orders FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own purchase orders" ON public.purchase_orders FOR DELETE USING (auth.uid() = user_id);

-- Purchase order items policies
CREATE POLICY "Users can view their own purchase order items" ON public.purchase_order_items FOR SELECT 
USING (EXISTS (SELECT 1 FROM purchase_orders WHERE purchase_orders.id = purchase_order_items.purchase_order_id AND purchase_orders.user_id = auth.uid()));
CREATE POLICY "Users can insert their own purchase order items" ON public.purchase_order_items FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM purchase_orders WHERE purchase_orders.id = purchase_order_items.purchase_order_id AND purchase_orders.user_id = auth.uid()));
CREATE POLICY "Users can update their own purchase order items" ON public.purchase_order_items FOR UPDATE 
USING (EXISTS (SELECT 1 FROM purchase_orders WHERE purchase_orders.id = purchase_order_items.purchase_order_id AND purchase_orders.user_id = auth.uid()));
CREATE POLICY "Users can delete their own purchase order items" ON public.purchase_order_items FOR DELETE 
USING (EXISTS (SELECT 1 FROM purchase_orders WHERE purchase_orders.id = purchase_order_items.purchase_order_id AND purchase_orders.user_id = auth.uid()));

-- Create function for auto-generating estimate number
CREATE OR REPLACE FUNCTION public.generate_estimate_number()
RETURNS TRIGGER AS $$
DECLARE
    year_month TEXT;
    seq_num INTEGER;
BEGIN
    year_month := to_char(CURRENT_DATE, 'YYYYMM');
    SELECT COALESCE(MAX(CAST(SUBSTRING(estimate_number FROM 8) AS INTEGER)), 0) + 1
    INTO seq_num
    FROM public.estimates
    WHERE estimate_number LIKE 'EST' || year_month || '%';
    
    NEW.estimate_number := 'EST' || year_month || LPAD(seq_num::TEXT, 4, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create function for auto-generating purchase order number
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TRIGGER AS $$
DECLARE
    year_month TEXT;
    seq_num INTEGER;
BEGIN
    year_month := to_char(CURRENT_DATE, 'YYYYMM');
    SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM 8) AS INTEGER)), 0) + 1
    INTO seq_num
    FROM public.purchase_orders
    WHERE order_number LIKE 'PO-' || year_month || '%';
    
    NEW.order_number := 'PO-' || year_month || LPAD(seq_num::TEXT, 4, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for auto-generating numbers
CREATE TRIGGER set_estimate_number
    BEFORE INSERT ON public.estimates
    FOR EACH ROW
    WHEN (NEW.estimate_number IS NULL OR NEW.estimate_number = '')
    EXECUTE FUNCTION public.generate_estimate_number();

CREATE TRIGGER set_order_number
    BEFORE INSERT ON public.purchase_orders
    FOR EACH ROW
    WHEN (NEW.order_number IS NULL OR NEW.order_number = '')
    EXECUTE FUNCTION public.generate_order_number();

-- Create triggers for updated_at
CREATE TRIGGER update_estimates_updated_at
    BEFORE UPDATE ON public.estimates
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_purchase_orders_updated_at
    BEFORE UPDATE ON public.purchase_orders
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();