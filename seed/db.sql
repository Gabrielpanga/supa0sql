CREATE OR REPLACE FUNCTION public.execute_api_query(query text, OUT result text)
    LANGUAGE 'plpgsql'
AS $BODY$
    BEGIN
        if 
            query ilike '%' || 'DELETE ' || '%' or 
            query ilike '%' || 'DROP ' || '%' or 
            query ilike '%' || 'INSERT ' || '%' or
            query ilike '%' || 'UPDATE ' || '%' 
        then
            result := 'invalid query';
            return;
        end if;

        EXECUTE query;
        result := 'ok';
        return;
    END 
$BODY$ SECURITY DEFINER;