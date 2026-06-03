<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\Restaurante;
use App\Models\Platillo;
use App\Models\Guarnicion;
use App\Models\TipoPlatillo;

class ApiController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'username' => 'required',
            'password' => 'required',
        ]);

        $user = User::where('username', $request->username)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            return response()->json(['error' => 'Invalid credentials'], 401);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'username' => $user->username,
                'role_id' => $user->role_id,
            ]
        ]);
    }

    public function register(Request $request)
    {
        $request->validate([
            'username' => 'required|unique:users,username',
            'password' => 'required',
            'email' => 'required|email|unique:users,email',
        ]);

        $user = User::create([
            'username' => $request->username,
            'password' => Hash::make($request->password),
            'email' => $request->email,
            'role_id' => $request->role_id ?? 2,
            'created_at' => now()
        ]);

        $defaultSlug = strtolower($request->username) . '-menu-' . rand(100, 999);
        Restaurante::create([
            'user_id' => $user->id,
            'slug' => $defaultSlug,
            'nombre' => $request->restaurant_name ?? 'Menú de ' . $request->username,
            'whatsapp' => $request->whatsapp ?? '59100000000',
            'tema' => 'light'
        ]);

        return response()->json(['id' => $user->id, 'username' => $user->username, 'email' => $user->email], 201);
    }

    public function getRestaurantes(Request $request)
    {
        if ($request->user()->role_id === 1) {
            return response()->json(
                Restaurante::select('restaurantes.*', 'users.username as owner_name')
                    ->leftJoin('users', 'restaurantes.user_id', '=', 'users.id')
                    ->orderBy('nombre', 'asc')
                    ->get()
            );
        }

        return response()->json(
            Restaurante::select('restaurantes.*', 'users.username as owner_name')
                ->leftJoin('users', 'restaurantes.user_id', '=', 'users.id')
                ->where('restaurantes.user_id', $request->user()->id)
                ->orderBy('nombre', 'asc')
                ->get()
        );
    }

    public function getRestauranteById($id)
    {
        $restaurante = Restaurante::find($id);
        if (!$restaurante) return response()->json(['error' => 'Restaurante not found'], 404);
        
        $restaurante->platillos = Platillo::where('restaurante_id', $id)->orderBy('orden', 'asc')->get();
        return response()->json($restaurante);
    }

    public function getRestauranteBySlug($slug)
    {
        $restaurante = Restaurante::where('slug', $slug)->first();
        if (!$restaurante) return response()->json(['error' => 'Restaurante not found'], 404);
        
        $restaurante->platillos = Platillo::where('restaurante_id', $restaurante->id)->orderBy('orden', 'asc')->get();
        return response()->json($restaurante);
    }

    public function createRestaurante(Request $request)
    {
        $restaurante = Restaurante::create([
            'slug' => $request->slug,
            'nombre' => $request->nombre,
            'whatsapp' => $request->whatsapp,
            'whatsapp_opcional' => $request->whatsapp_opcional,
            'tema' => $request->tema,
            'imagen_url' => $request->imagen_url,
            'horarios' => $request->horarios,
            'user_id' => $request->user()->id
        ]);

        return response()->json(['id' => $restaurante->id, 'slug' => $restaurante->slug, 'nombre' => $restaurante->nombre], 201);
    }

    public function updateRestaurante(Request $request, $id)
    {
        $restaurante = Restaurante::find($id);
        if (!$restaurante) return response()->json(['error' => 'Not found'], 404);

        if ($restaurante->user_id !== $request->user()->id && $request->user()->role_id !== 1) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $restaurante->update([
            'nombre' => $request->nombre,
            'whatsapp' => $request->whatsapp,
            'slug' => $request->slug,
            'horarios' => $request->horarios,
            'imagen_url' => $request->imagen_url
        ]);

        return response()->json(['message' => 'Updated successfully']);
    }

    public function uploadLogo(Request $request, $id)
    {
        $request->validate([
            'logo' => 'required|image|mimes:jpeg,png,jpg,gif,svg,webp|max:2048',
        ]);

        $restaurante = Restaurante::find($id);
        if (!$restaurante) {
            return response()->json(['error' => 'Restaurante not found'], 404);
        }

        if ($restaurante->user_id !== $request->user()->id && $request->user()->role_id !== 1) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        if ($request->hasFile('logo')) {
            $file = $request->file('logo');
            $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
            
            // Move file to public/uploads/logos
            $file->move(public_path('uploads/logos'), $filename);
            
            $logoUrl = asset('uploads/logos/' . $filename);
            
            $restaurante->imagen_url = $logoUrl;
            $restaurante->save();

            return response()->json([
                'message' => 'Logo uploaded successfully',
                'imagen_url' => $logoUrl
            ]);
        }

        return response()->json(['error' => 'No file uploaded'], 400);
    }

    public function saveFullMenu(Request $request)
    {
        $restaurante = Restaurante::find($request->restaurante_id);
        if (!$restaurante) return response()->json(['error' => 'Restaurante not found'], 404);

        if ($restaurante->user_id !== $request->user()->id && $request->user()->role_id !== 1) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $updateData = [
            'nombre' => $request->name,
            'tema' => $request->theme,
            'direccion' => $request->direccion,
            'horarios' => $request->horarios,
            'tagline' => $request->tagline,
            'promo' => $request->promo,
            'precio_menu' => $request->precio_menu ?? 0
        ];

        if ($request->has('slug')) $updateData['slug'] = $request->slug;
        if ($request->has('whatsapp')) $updateData['whatsapp'] = $request->whatsapp;
        if ($request->has('imagen_url')) $updateData['imagen_url'] = $request->imagen_url;

        $restaurante->update($updateData);

        // Delete existing
        DB::table('platillo_guarniciones')->whereIn('platillo_id', function ($query) use ($restaurante) {
            $query->select('id')->from('platillos')->where('restaurante_id', $restaurante->id);
        })->delete();
        Platillo::where('restaurante_id', $restaurante->id)->delete();
        Guarnicion::where('restaurante_id', $restaurante->id)->delete();

        // Insert Guarniciones
        $guarnicionesArray = $request->guarniciones ? array_filter(array_map('trim', explode(',', $request->guarniciones))) : [];
        foreach ($guarnicionesArray as $gName) {
            Guarnicion::create(['restaurante_id' => $restaurante->id, 'nombre' => $gName]);
        }

        // Insert Platillos
        $typeMap = ['sopa' => 1, 'segundo' => 2, 'segundo suelto' => 3, 'postre' => 4, 'bebida' => 5, 'standard' => 2];
        
        if (is_array($request->items)) {
            foreach ($request->items as $i => $item) {
                $tipoId = $typeMap[$item['type'] ?? ''] ?? 2;
                Platillo::create([
                    'restaurante_id' => $restaurante->id,
                    'tipo_id' => $tipoId,
                    'nombre' => $item['name'],
                    'precio' => $item['price'] ?? 0,
                    'emoji' => $item['emoji'] ?? null,
                    'orden' => $i,
                    'acompanamientos' => !empty($item['acompanamientos'])
                        ? json_encode($item['acompanamientos'])
                        : null
                ]);
            }
        }

        return response()->json(['message' => 'Menu saved successfully']);
    }

    public function getUsers(Request $request)
    {
        if ($request->user()->role_id !== 1) {
            return response()->json(['error' => 'Admin access required'], 403);
        }
        return response()->json(User::select('id', 'username', 'email', 'role_id', 'created_at')->orderBy('created_at', 'desc')->get());
    }

    public function updateUser(Request $request, $id)
    {
        if ($request->user()->role_id !== 1) {
            return response()->json(['error' => 'Admin access required'], 403);
        }

        $user = User::find($id);
        if (!$user) return response()->json(['error' => 'Not found'], 404);

        $user->username = $request->username;
        $user->email = $request->email;
        $user->role_id = $request->role_id;

        if ($request->filled('password')) {
            $user->password = Hash::make($request->password);
        }

        $user->save();
        return response()->json(['message' => 'User updated successfully']);
    }

    public function getTiposPlatillo()
    {
        return response()->json(TipoPlatillo::orderBy('id', 'asc')->get());
    }
}
